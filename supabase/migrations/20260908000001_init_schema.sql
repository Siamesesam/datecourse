-- ============================================================
-- DateCourse — 초기 스키마 (테이블 6개)
-- 근거: projects/01-datecourse/docs/03-data-model.md §2
-- 적용: Supabase SQL Editor 에 붙여넣고 Run
-- ============================================================

-- ------------------------------------------------------------
-- updated_at 자동 갱신 트리거 함수
-- 데이터모델 문서에는 updated_at 컬럼만 있고 갱신 수단이 없었습니다.
-- 애플리케이션 코드에 맡기면 언젠가 빠뜨립니다. DB가 책임집니다.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- course — 코스
-- ------------------------------------------------------------
create table public.course (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  title            text not null default '이름 없는 코스',
  course_date      date,                     -- 언제 가는 코스인가
  start_at         time,                     -- 첫 장소 출발 시각. 타임라인 계산의 기준점
  travel_mode      text not null default 'car'
                     check (travel_mode in ('car', 'transit', 'walk')),
  share_token      uuid unique not null default gen_random_uuid(),  -- 공유 링크용. 추측 불가
  share_expires_at timestamptz,              -- null = 만료 없음
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- share_token 은 unique 제약이 이미 인덱스를 만듭니다. 별도 인덱스 X.
create index course_owner_date_idx on public.course (owner_id, course_date desc);

create trigger course_set_updated_at
  before update on public.course
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- place — 장소 (검색 결과 캐시)
-- ------------------------------------------------------------
create table public.place (
  id           text primary key,             -- "{provider}:{providerId}"  예: "kakao:26338954"
  provider     text not null check (provider in ('kakao', 'naver')),
  name         text not null,
  category     text,
  address      text,
  road_address text,
  lat          double precision not null,
  lng          double precision not null,
  phone        text,
  url          text,
  fetched_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- course_item — 코스 안의 장소
-- ------------------------------------------------------------
create table public.course_item (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.course(id) on delete cascade,
  place_id     text references public.place(id),  -- null 허용: 직접 입력 장소
  position     integer not null,                  -- 0부터. 드래그 순서
  stay_min     integer not null default 60,       -- 체류 시간(분)
  budget       integer not null default 0,        -- 원
  memo         text,

  -- 스냅샷 (place 가 지워지거나 바뀌어도 코스는 살아야 함)
  snap_name    text not null,
  snap_address text,
  snap_lat     double precision not null,
  snap_lng     double precision not null,

  created_at   timestamptz not null default now(),

  -- ⚠️ deferrable initially deferred 가 핵심입니다.
  -- 순서를 바꿀 때 트랜잭션 중간에 position 이 일시적으로 중복되는데,
  -- 즉시 검사하면 정상적인 재정렬이 실패합니다.
  constraint course_item_course_position_key
    unique (course_id, position) deferrable initially deferred
);

-- 위 unique 제약이 (course_id, position) 인덱스를 이미 만듭니다. 중복 인덱스 X.

-- ------------------------------------------------------------
-- comment — 코멘트 · 이모지 반응
-- ------------------------------------------------------------
create table public.comment (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.course(id) on delete cascade,
  item_id    uuid references public.course_item(id) on delete cascade,  -- null = 코스 전체 대상
  author_id  uuid references auth.users(id) on delete set null,         -- null = 게스트
  guest_name text,                           -- 게스트가 남긴 표시 이름
  body       text,
  emoji      text,                           -- 이모지 반응. body 와 둘 중 하나는 필수
  created_at timestamptz not null default now(),
  constraint comment_body_or_emoji check (body is not null or emoji is not null)
);

create index comment_course_created_idx on public.comment (course_id, created_at desc);

-- ------------------------------------------------------------
-- directions_cache — 경로 응답 캐시 ⚠️ 비용 방어
-- ------------------------------------------------------------
create table public.directions_cache (
  cache_key  text primary key,               -- hash(좌표시퀀스 + travel_mode)
  response   jsonb not null,                 -- RouteResult 그대로
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);

create index directions_cache_expires_idx on public.directions_cache (expires_at);

-- ------------------------------------------------------------
-- api_call_counter — 일일 호출 상한
-- ------------------------------------------------------------
create table public.api_call_counter (
  day      date not null,
  provider text not null,                    -- 'ncp_directions' | 'kakao_local' | ...
  count    integer not null default 0,
  primary key (day, provider)
);
