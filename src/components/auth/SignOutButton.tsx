"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        // ⚠️ push 가 아니라 refresh 입니다. 서버 컴포넌트가 다시 렌더돼야
        //    (main)/layout.tsx 의 가드가 돌면서 /login 으로 보냅니다.
        router.refresh();
      }}
    >
      로그아웃
    </Button>
  );
}
