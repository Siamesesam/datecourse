-- ============================================================
-- DateCourse — RLS 활성화 + 정책 (v0.1 소유자 전용)
-- 근거: projects/01-datecourse/docs/03-data-model.md §3
-- ⚠️ 반드시 20260908000001_init_schema.sql 다음에 실행합니다.
--
-- publishable key 는 브라우저에 노출되는 것이 정상이고,
-- 보안은 전적으로 이 파일이 담당합니다.
-- ============================================================

-- ------------------------------------------------------------
-- 1. 전 테이블 RLS 활성화
-- ------------------------------------------------------------
alter table public.course           enable row level security;
alter table public.course_item      enable row level security;
alter table public.comment          enable row level security;
alter table public.place            enable row level security;
alter table public.directions_cache enable row level security;
alter table public.api_call_counter enable row level security;

-- ------------------------------------------------------------
-- 2. 정책
--
-- auth.uid() 를 (select auth.uid()) 로 감쌉니다.
-- 이렇게 하면 행마다 재평가되지 않고 한 번만 계산돼서,
-- 코스가 늘어나도 쿼리가 선형으로 느려지지 않습니다.
-- ------------------------------------------------------------

-- course: 소유자만 전부
create policy course_owner_all on public.course
  for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- course_item: 부모 course 의 소유권을 상속
create policy course_item_owner_all on public.course_item
  for all
  to authenticated
  using (exists (
    select 1 from public.course c
    where c.id = course_item.course_id and c.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.course c
    where c.id = course_item.course_id and c.owner_id = (select auth.uid())
  ));

-- comment: 코스 소유자는 전부 조회/삭제 가능
-- (게스트 작성 경로는 W3 ADR-003 까지 서버 Route Handler + secret key 로 처리)
create policy comment_owner_all on public.comment
  for all
  to authenticated
  using (exists (
    select 1 from public.course c
    where c.id = comment.course_id and c.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.course c
    where c.id = comment.course_id and c.owner_id = (select auth.uid())
  ));

-- place: 캐시이므로 로그인 사용자면 읽기 허용. 쓰기는 서버(secret key)만.
create policy place_read on public.place
  for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- 3. 정책을 만들지 않는 테이블 — 의도된 것입니다
--
-- directions_cache · api_call_counter 는 RLS 가 켜져 있고 정책이 없습니다.
-- 이 상태에서는 secret key(service_role) 외에 아무도 접근하지 못합니다.
-- 서버 전용 테이블에 정확히 원하는 동작입니다. 정책을 추가하지 마세요.
-- ------------------------------------------------------------
