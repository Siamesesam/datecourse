"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

/**
 * 버튼.
 *
 * shadcn/ui 를 쓰지 않고 직접 만든 이유는 `docs/` 의 브랜드 규칙 때문입니다 —
 * shadcn 은 자체 색 팔레트(`--primary` 등)를 들고 오는데,
 * CLAUDE.md 는 **액센트 4색 외의 색을 금지**합니다. 팔레트가 두 벌이 되면 규칙이 먼저 무너집니다.
 * 대신 접근성이 까다로운 것(시트·셀렉트)은 그때 Radix/vaul 을 직접 붙입니다.
 */
const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:opacity-90",
  secondary: "bg-surface-raised text-text border border-border hover:bg-surface",
  ghost: "text-text-muted hover:text-text hover:bg-surface",
  danger: "bg-danger text-bg hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function Button({ variant = "secondary", size = "md", className, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-opacity",
        // 키보드 포커스가 보여야 합니다 — 접근성 요구사항(PRD §6)
        "focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jd-bg)] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}
