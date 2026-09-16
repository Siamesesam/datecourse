import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * 모서리 컷 패널 — 브랜드 시그니처 모티프 1번.
 *
 * 우상단·좌하단을 `--jd-cut`(8px) 사선으로 잘라냅니다.
 * **`clip-path` 를 화면마다 복붙하면 값이 갈라집니다.** 여기 한 곳에서만 씁니다.
 *
 * ⚠️ 왜 2겹인가 —
 *
 * 1. **`clip-path` 는 테두리를 같이 잘라냅니다.** `border` 를 주면 잘린 사선 변에는
 *    선이 안 그려져서 모서리만 뚫린 것처럼 보입니다.
 * 2. **라이트 모드에서는 `surface-raised` 와 `bg` 가 둘 다 흰색입니다.**
 *    배경색만으로는 경계가 사라집니다 (실측으로 확인).
 *
 * 그래서 바깥 레이어를 테두리 색으로 칠하고 1px 안쪽에 본체를 얹습니다.
 * 두 레이어가 같은 `clip-path` 를 쓰므로 사선 변에도 테두리가 남습니다.
 */
type Props<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  /** 내부 여백. 기본 없음 — 호출자가 className 으로 줍니다 */
  innerClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const CUT = "var(--jd-cut)";
const CLIP = `polygon(0 0, calc(100% - ${CUT}) 0, 100% ${CUT}, 100% 100%, ${CUT} 100%, 0 calc(100% - ${CUT}))`;

export function CutPanel<T extends ElementType = "div">({
  as,
  className,
  innerClassName,
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn("bg-border p-px", className)} style={{ clipPath: CLIP }} {...rest}>
      <div
        className={cn("bg-surface-raised h-full w-full", innerClassName)}
        style={{ clipPath: CLIP }}
      >
        {children}
      </div>
    </Tag>
  );
}
