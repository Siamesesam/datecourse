import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 브라우저용 Supabase 클라이언트.
 *
 * 클라이언트 컴포넌트("use client")에서만 씁니다.
 * publishable key 가 번들에 들어가는 것은 **정상**입니다 — 보안은 RLS 가 담당합니다.
 * (근거: docs/03-data-model.md §3)
 *
 * `createBrowserClient` 는 내부적으로 싱글턴을 유지하므로
 * 렌더마다 호출해도 커넥션이 늘지 않습니다.
 */
export function createClient() {
  return createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey);
}
