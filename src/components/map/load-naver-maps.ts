import { publicEnv } from "@/lib/env";

/**
 * 네이버 지도 JS API v3 를 한 번만 로드합니다.
 *
 * ⚠️ 함정 3개 —
 *
 * 1. **파라미터 이름이 `ncpKeyId` 입니다.** 검색해서 나오는 예제 대부분은 아직 `ncpClientId`
 *    를 쓰는데 지금은 동작하지 않습니다.
 *    (https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html)
 *
 * 2. **인증 실패는 조용합니다.** 도메인 화이트리스트에 없으면 스크립트는 200 으로 잘 내려오고
 *    지도만 안 그려집니다. 네이버는 `window.navermap_authFailure` 전역 함수를 호출해서
 *    알려주는데, **정의해두지 않으면 아무 일도 일어나지 않습니다.** 여기서 정의합니다.
 *
 * 3. React StrictMode 는 개발 중 effect 를 두 번 실행합니다. 모듈 레벨 프라미스로
 *    **중복 로드를 막습니다** — 안 막으면 스크립트 태그가 두 개 붙습니다.
 */

type NaverMaps = typeof naver.maps;

declare global {
  interface Window {
    navermap_authFailure?: () => void;
  }
}

const SCRIPT_ID = "naver-maps-v3";

let loadPromise: Promise<NaverMaps> | null = null;

export function loadNaverMaps(): Promise<NaverMaps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadNaverMaps 는 브라우저에서만 호출할 수 있습니다."));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<NaverMaps>((resolve, reject) => {
    if (window.naver?.maps) {
      resolve(window.naver.maps);
      return;
    }

    const fail = (message: string) => {
      loadPromise = null; // 다음 시도에서 다시 로드할 수 있게 풀어둡니다
      reject(new Error(message));
    };

    // 함정 2 — 인증 실패를 들을 수 있는 유일한 창구
    window.navermap_authFailure = () => {
      fail(
        "네이버 지도 인증에 실패했습니다. NCP 콘솔의 Web 서비스 URL 화이트리스트에 " +
          `${window.location.origin} 이 있는지, Client ID 가 맞는지 확인하세요.`,
      );
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else fail("스크립트는 로드됐지만 naver.maps 가 없습니다.");
    });
    script.addEventListener("error", () => fail("네이버 지도 스크립트를 내려받지 못했습니다."));

    if (!existing) {
      script.id = SCRIPT_ID;
      script.async = true;
      // submodules=geocoder — 좌표↔주소 변환. 지금은 안 쓰지만 나중에 붙일 때
      // 스크립트 URL 을 바꾸면 캐시가 통째로 무효화되므로 처음부터 넣어둡니다.
      script.src =
        `https://oapi.map.naver.com/openapi/v3/maps.js` +
        `?ncpKeyId=${encodeURIComponent(publicEnv.ncpMapClientId)}` +
        `&submodules=geocoder`;
      document.head.appendChild(script);
    }
  });

  return loadPromise;
}
