import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 매 요청마다 Supabase 세션 쿠키를 갱신합니다.
 *
 * 이게 없으면 액세스 토큰이 만료된 뒤 **서버 컴포넌트에서만** 로그아웃 상태가 되어
 * "새로고침하면 로그인이 풀리는" 재현하기 어려운 버그가 생깁니다.
 * 서버 컴포넌트는 쿠키를 못 쓰기 때문에(→ server.ts 주석) 갱신 책임이 여기 있습니다.
 *
 * ⚠️ 반드시 `supabaseResponse` 를 그대로 반환합니다.
 *    새 NextResponse 를 만들어 반환하면 갱신된 쿠키가 사라집니다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // ⚠️ getSession() 이 아니라 getUser() 입니다.
  //    getSession() 은 쿠키를 그대로 믿습니다. getUser() 만 Auth 서버에 검증을 겁니다.
  await supabase.auth.getUser();

  return supabaseResponse;
}
