import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/utils/url";

/**
 * OAuth 콜백 — 구글이 Supabase 로, Supabase 가 여기로 되돌려 보냅니다.
 *
 * Route Handler 이므로 **쿠키를 쓸 수 있습니다.** (서버 컴포넌트에서는 못 씁니다 — server.ts 주석)
 * 세션 쿠키가 실제로 심어지는 지점이 여기입니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // 구글이 거부한 경우 — 테스트 사용자 목록에 없으면 access_denied 가 옵니다
  const oauthError = searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`);
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const next = safeInternalPath(searchParams.get("next"));

  /**
   * ⚠️ Vercel 뒤에서는 `origin` 이 내부 주소일 수 있습니다.
   *    그대로 리다이렉트하면 사용자가 `map.jaydench.co.kr` 대신
   *    Vercel 내부 호스트로 튕겨 나갑니다. `x-forwarded-host` 를 우선합니다.
   */
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;

  return NextResponse.redirect(`${base}${next}`);
}
