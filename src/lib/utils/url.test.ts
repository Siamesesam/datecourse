import { describe, expect, it } from "vitest";

import { safeInternalPath } from "./url";

describe("safeInternalPath", () => {
  it("내부 경로는 그대로 통과시킨다", () => {
    expect(safeInternalPath("/course/abc")).toBe("/course/abc");
    expect(safeInternalPath("/?q=1")).toBe("/?q=1");
  });

  it("값이 없으면 기본값", () => {
    expect(safeInternalPath(null)).toBe("/");
    expect(safeInternalPath("")).toBe("/");
    expect(safeInternalPath(undefined)).toBe("/");
  });

  // ★ 여기가 이 함수의 존재 이유입니다
  it("외부로 나가는 값은 전부 막는다", () => {
    expect(safeInternalPath("https://evil.example")).toBe("/");
    expect(safeInternalPath("//evil.example")).toBe("/"); // 프로토콜 상대 URL
    expect(safeInternalPath("/\\evil.example")).toBe("/"); // 역슬래시 정규화
    expect(safeInternalPath("javascript:alert(1)")).toBe("/");
    expect(safeInternalPath("course/abc")).toBe("/"); // 슬래시 없는 상대 경로
  });
});
