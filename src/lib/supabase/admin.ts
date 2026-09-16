import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * ⚠️ RLS 를 **우회하는** 클라이언트입니다. 기본값이 아닙니다.
 *
 * 여기서만 씁니다:
 *   - `directions_cache` · `api_call_counter` (RLS 정책이 없는 서버 전용 테이블)
 *   - `place` 쓰기 (검색 결과 캐시 적재)
 *   - `/share/[token]` 게스트 경로 — 토큰을 **직접 검증한 뒤에만**
 *     (W3 ADR-003 에서 RLS 로 옮길지 결정합니다)
 *
 * 위 세 가지가 아니면 `server.ts` 를 쓰세요. 여기에 쿼리를 늘리면 RLS 가 장식이 됩니다.
 *
 * `import "server-only"` 가 있어서 클라이언트 컴포넌트에서 import 하면
 * **런타임이 아니라 빌드에서** 실패합니다 — 키가 번들에 들어가는 사고를 막습니다.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(publicEnv.supabaseUrl, serverEnv.supabaseSecretKey, {
    auth: {
      // 서버에는 로그인 세션이 없습니다. 토큰 갱신·저장을 전부 끕니다.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
