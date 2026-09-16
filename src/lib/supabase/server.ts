import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 서버용 Supabase 클라이언트 (사용자 세션 기준).
 *
 * 서버 컴포넌트 · Route Handler · Server Action 에서 씁니다.
 * publishable key 를 쓰므로 **RLS 가 그대로 적용됩니다** — 이게 기본값이어야 합니다.
 * RLS 를 우회해야 하는 곳에서만 `admin.ts` 를 씁니다.
 *
 * ⚠️ Next 16 에서 `cookies()` 는 **async 전용**입니다. await 를 빠뜨리면 타입부터 깨집니다.
 * ⚠️ 요청마다 새로 만듭니다. 모듈 레벨 변수에 담아두면 다른 사용자의 세션이 섞입니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없습니다 — 렌더 중에는 응답 헤더가 이미 닫혀 있습니다.
          // 세션 갱신은 proxy.ts 가 담당하므로 여기서는 무시해도 안전합니다.
        }
      },
    },
  });
}
