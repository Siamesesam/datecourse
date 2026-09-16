import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next 16 에서 `middleware.ts` 는 `proxy.ts` 로 이름이 바뀌었습니다.
 * 검색해서 나오는 Supabase 예제는 대부분 아직 `middleware.ts` 기준입니다 — 내용은 같습니다.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래를 뺀 모든 경로에서 실행합니다:
     * - _next/static, _next/image  정적 자산
     * - favicon.ico 및 이미지 파일
     *
     * ⚠️ 정적 자산을 안 빼면 CSS·JS 요청마다 Auth 서버를 때립니다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
