/**
 * 로그인 후 돌아갈 내부 경로만 허용합니다.
 *
 * ⚠️ **열린 리다이렉트(open redirect) 방어입니다.**
 * `?next=` 를 그대로 믿으면 `?next=https://evil.example` 로 외부 사이트에 보낼 수 있습니다.
 * 피싱에 그대로 쓰이는 고전적인 구멍이라, 값을 쓰는 모든 지점이 이 함수를 거칩니다.
 */
export function safeInternalPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  // "/" 로 시작하지 않으면 외부 URL 이거나 상대 경로입니다
  if (!value.startsWith("/")) return fallback;
  // "//evil.example" 은 프로토콜 상대 URL — 브라우저가 외부로 해석합니다
  if (value.startsWith("//")) return fallback;
  // "/\evil.example" — 일부 브라우저가 역슬래시를 슬래시로 정규화합니다
  if (value.startsWith("/\\")) return fallback;
  return value;
}
