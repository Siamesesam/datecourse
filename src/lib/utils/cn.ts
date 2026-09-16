import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 조건부 클래스 합성 + Tailwind 충돌 해소.
 *
 * `twMerge` 가 없으면 `cn("p-2", "p-4")` 가 둘 다 남아 **선언 순서**에 따라 결과가 갈립니다.
 * 컴포넌트가 기본 클래스를 주고 호출자가 덮어쓰는 구조에서는 필수입니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
