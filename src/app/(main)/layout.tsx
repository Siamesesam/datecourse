import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";

/**
 * 소유자 전용 구역의 인증 가드.
 *
 * ⚠️ `getSession()` 이 아니라 **`getUser()`** 입니다.
 *    `getSession()` 은 쿠키를 그대로 믿습니다 — 위조된 쿠키로 통과할 수 있습니다.
 *    `getUser()` 만 Auth 서버에 검증을 겁니다.
 *
 * ⚠️ 이 가드는 **화면 접근**만 막습니다. 데이터 보호는 RLS 가 합니다.
 *    가드를 우회해도 `anon` 에게는 아무 권한도 없어 0행입니다 (20260908000003_grants.sql).
 */
export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="bg-bg flex min-h-dvh flex-col">
      <header className="border-border bg-surface flex items-center justify-between gap-4 border-b px-5 py-3">
        <Link href="/" className="jd-wordmark text-text text-sm">
          JAYDEN MAP
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-text-muted hidden text-xs sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
