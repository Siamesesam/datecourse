-- ============================================================
-- DateCourse — 테이블 권한(GRANT)
-- ⚠️ 20260908000002_rls.sql 다음에 실행합니다.
--
-- 왜 필요한가 —
-- Postgres 는 접근을 **두 단계**로 검사합니다.
--
--   1) GRANT   역할이 이 테이블을 건드릴 수 있는가        ← 이게 없으면 42501
--   2) RLS     그중 어떤 '행'을 볼 수 있는가              ← 정책이 담당
--
-- Supabase 는 보통 default privileges 로 1)을 자동 처리하지만,
-- SQL Editor 로 만든 테이블에는 적용되지 않아 실측에서 두 역할 다 막혔습니다.
--   publishable → 401 permission denied for table course
--   secret      → 403 permission denied for table course
-- 그래서 명시적으로 씁니다. 명시된 권한은 나중에 읽어도 의도가 보입니다.
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- authenticated — 로그인한 소유자
-- 행 단위 필터는 RLS 정책이 담당합니다. 여기서는 '테이블에 닿을 수 있다'까지만.
-- ------------------------------------------------------------
grant select, insert, update, delete on public.course      to authenticated;
grant select, insert, update, delete on public.course_item to authenticated;
grant select, insert, update, delete on public.comment     to authenticated;

-- place 는 검색 결과 캐시입니다. 읽기만. 쓰기는 서버가 합니다.
grant select on public.place to authenticated;

-- ------------------------------------------------------------
-- anon — 비로그인
-- 아무것도 주지 않습니다.
-- 게스트 공유 뷰(/share/[token])는 서버 Route Handler 가 토큰을 검증한 뒤
-- secret key 로 처리합니다 (docs/03-data-model.md §3, W3 ADR-003 에서 재검토).
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- service_role — 서버 전용 secret key
-- RLS 를 우회하는 역할이므로 전부 허용합니다.
-- directions_cache · api_call_counter 는 오직 이 역할로만 접근됩니다.
-- ------------------------------------------------------------
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- 앞으로 추가할 테이블에도 자동 적용 (다음 마이그레이션에서 또 막히지 않도록)
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
