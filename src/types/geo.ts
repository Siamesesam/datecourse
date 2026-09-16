/**
 * 앱 전체가 쓰는 지리 도메인 타입.
 *
 * **좌표는 전부 WGS84 경위도입니다.** TM128 같은 변환 좌표계는 DB 에도 여기에도 넣지 않습니다.
 * 벤더 응답(카카오의 문자열 x/y, NCP 의 [lng, lat] 배열)은 어댑터 안에서 이 타입으로 바꿉니다.
 *
 * 근거: projects/01-datecourse/docs/02-architecture.md §4 · adr/ADR-001-map-provider.md
 */

export type LatLng = { lat: number; lng: number };

export type PlaceProvider = "kakao" | "naver";

export type Place = {
  /** "{provider}:{providerId}" — 예: "kakao:26338954". 벤더가 늘어도 ID 가 충돌하지 않습니다 */
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress?: string;
  location: LatLng;
  phone?: string;
  url?: string;
  provider: PlaceProvider;
};

export type TravelMode = "car" | "transit" | "walk";

export type RouteLeg = {
  from: LatLng;
  to: LatLng;
  distanceM: number;
  /** ⚠️ 초입니다. NCP 응답은 **밀리초**라 어댑터에서 나눕니다 */
  durationSec: number;
  /** 폴리라인 좌표 */
  path: LatLng[];
};

export type RouteResult = {
  legs: RouteLeg[];
  totalDistanceM: number;
  totalDurationSec: number;
};

/**
 * 코스에 담을 수 있는 장소의 최대 개수.
 *
 * ⚠️ 우리가 고른 수가 아니라 **벤더 제약**입니다.
 * NCP Directions 5 는 중간 경유지를 5개까지만 받습니다.
 * 요청 좌표 = [출발, ...중간, 도착] 이므로  N - 2 ≤ 5  →  N ≤ 7.
 */
export const MAX_COURSE_PLACES = 7;

/** 지도 초기 중심 — 서울시청. 위치 권한을 거부당했을 때의 폴백입니다 */
export const DEFAULT_CENTER: LatLng = { lat: 37.5666805, lng: 126.9784147 };
