"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { CutPanel } from "@/components/ui/cut-panel";
import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/utils/url";

export default function LoginPage() {
  return (
    // useSearchParams 는 Suspense 경계가 필요합니다.
    // 없으면 빌드에서 "missing suspense boundary with useSearchParams" 로 실패합니다.
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}

function LoginScreen() {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage(params.get("error")));

  async function signIn() {
    setBusy(true);
    setError(null);

    const next = params.get("next");
    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", safeInternalPath(next));

    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    // 성공하면 브라우저가 구글로 넘어가므로 아래는 실행되지 않습니다.
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  return (
    <main className="bg-bg flex min-h-dvh items-center justify-center p-6">
      <CutPanel className="w-full max-w-sm" innerClassName="p-8">
        <p className="jd-wordmark text-text text-lg">JAYDEN MAP</p>
        <p className="text-text-muted mt-2 text-sm leading-relaxed">
          데이트 코스를 짜고, 링크 하나로 공유합니다.
        </p>

        <Button variant="primary" className="mt-8 w-full" disabled={busy} onClick={signIn}>
          {busy ? "구글로 이동 중…" : "Google 계정으로 계속하기"}
        </Button>

        {error && (
          <p className="text-danger mt-4 text-sm leading-relaxed" role="alert">
            {error}
          </p>
        )}

        <p className="text-text-muted mt-6 text-xs leading-relaxed">
          코스를 만들려면 로그인이 필요합니다. 공유받은 링크는 로그인 없이 열립니다.
        </p>
      </CutPanel>
    </main>
  );
}

/**
 * 브랜드 보이스 — **시스템은 사과하지 않습니다.**
 * 무엇이 실패했고 무엇을 하면 되는지만 말합니다 (브랜드 §9).
 */
function errorMessage(code: string | null): string | null {
  if (!code) return null;
  if (code === "access_denied") {
    return "이 계정은 아직 허용되지 않았습니다. Google Cloud 콘솔의 테스트 사용자에 계정을 추가하세요.";
  }
  if (code === "no_code") {
    return "로그인이 완료되지 않았습니다. 다시 시도해주세요.";
  }
  return code;
}
