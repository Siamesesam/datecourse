"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";

/** 브랜드 토큰 검증 페이지 — W1 스캐폴딩 확인용. 실제 화면은 05-ui-flow.md 참고 */
export default function Home() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="jd-wordmark text-2xl text-text">JAYDEN MAP</h1>
        <div className="flex gap-1">
          {(["system", "light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`jd-label border px-3 py-1.5 ${
                mode === m
                  ? "border-accent text-accent"
                  : "border-border text-text-muted"
              }`}
              style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <p className="mt-2 text-sm text-text-muted">
        토큰 검증 페이지입니다. 세 버튼으로 라이트/다크를 강제해 두 스킨을 확인합니다.
      </p>

      {/* 액센트 4색 — 상태를 색만으로 전달하지 않으므로 라벨을 함께 둡니다 */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { name: "ACCENT", text: "text-accent", glow: "bg-accent-glow" },
          { name: "ATTENTION", text: "text-attention", glow: "bg-attention-glow" },
          { name: "DANGER", text: "text-danger", glow: "bg-danger-glow" },
          { name: "SUCCESS", text: "text-success", glow: "bg-success-glow" },
        ].map((c) => (
          <div
            key={c.name}
            className="border border-border bg-surface p-4"
            style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
          >
            <div className="flex items-center gap-2">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.glow}`} />
              <span className={`jd-label ${c.text}`}>{c.name}</span>
            </div>
            <p className={`mt-2 text-sm ${c.text}`}>텍스트 대비 확인</p>
          </div>
        ))}
      </section>

      {/* 등폭 숫자 — 이 앱은 숫자가 화면의 절반입니다 */}
      <section className="mt-6 border border-border bg-surface p-5">
        <span className="jd-label text-text-muted">TIMELINE SAMPLE</span>
        <ul className="mt-3 space-y-1.5 text-sm">
          {[
            ["14:00", "어니언 성수", "90분", "12,000원"],
            ["15:47", "성수족발", "80분", "45,000원"],
            ["17:20", "대림창고", "60분", "25,000원"],
          ].map(([time, name, stay, cost]) => (
            <li key={time} className="flex items-baseline gap-3">
              <span className="jd-num text-accent">{time}</span>
              <span className="flex-1 text-text">{name}</span>
              <span className="jd-num text-text-muted">{stay}</span>
              <span className="jd-num text-text-muted">{cost}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs text-text-muted">
        이 페이지에는 hex 값이 없습니다. 색이 보인다는 것 자체가 토큰이 동작한다는 증명입니다.
      </p>
    </main>
  );
}
