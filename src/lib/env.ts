/**
 * 환경변수 읽기.
 *
 * 왜 헬퍼를 두는가 —
 * Vercel 대시보드에 변수를 하나 빠뜨리면 `undefined` 가 그대로 흘러가서
 * "Invalid URL" 같은 **엉뚱한 지점**에서 터집니다. 여기서 이름을 대고 죽는 편이 낫습니다.
 *
 * ⚠️ `NEXT_PUBLIC_` 접두사가 없는 값을 클라이언트 컴포넌트에서 읽지 마세요.
 *    Next 는 빌드 때 `process.env.X` 를 **문자열로 치환**하므로,
 *    서버 전용 변수는 클라 번들에서 `undefined` 가 됩니다.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경변수 ${name} 가 비어 있습니다. ` +
        `로컬은 .env.local, 배포는 Vercel → Settings → Environment Variables 를 확인하세요.`,
    );
  }
  return value;
}

/** 브라우저에 노출돼도 되는 값 (도메인 제한 · RLS 로 방어) */
export const publicEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabasePublishableKey() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
  get ncpMapClientId() {
    return required("NEXT_PUBLIC_NCP_MAP_CLIENT_ID", process.env.NEXT_PUBLIC_NCP_MAP_CLIENT_ID);
  },
};

/** ⚠️ 서버 전용. 클라이언트 컴포넌트에서 import 하지 마세요. */
export const serverEnv = {
  get supabaseSecretKey() {
    return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
  },
  get kakaoRestApiKey() {
    return required("KAKAO_REST_API_KEY", process.env.KAKAO_REST_API_KEY);
  },
  get ncpMapClientSecret() {
    return required("NCP_MAP_CLIENT_SECRET", process.env.NCP_MAP_CLIENT_SECRET);
  },
  /** 일일 Directions 호출 상한. 버그로 인한 과금 폭주 방어선 */
  get dailyDirectionsLimit() {
    return Number(process.env.DAILY_DIRECTIONS_LIMIT ?? 500);
  },
};
