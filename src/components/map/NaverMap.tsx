"use client";

import { useEffect, useRef, useState } from "react";

import { loadNaverMaps } from "./load-naver-maps";
import { DEFAULT_CENTER, type LatLng } from "@/types/geo";

export type MapMarker = {
  id: string;
  position: LatLng;
  /** 코스 순번. 주면 번호 마커, 없으면 점 마커 */
  order?: number;
  label?: string;
};

type Props = {
  center?: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  /** 마커가 바뀔 때 전부 보이도록 화면을 맞춥니다 */
  fitToMarkers?: boolean;
  onMarkerClick?: (id: string) => void;
  className?: string;
};

/**
 * 네이버 지도.
 *
 * 벤더 타입(`naver.maps.*`)은 **이 파일 밖으로 나가지 않습니다.** props 는 전부 도메인 타입입니다.
 * 지도를 카카오로 바꾸게 되면 고칠 파일은 여기와 loadNaverMaps 둘뿐입니다 (ADR-001).
 */
export function NaverMap({
  center = DEFAULT_CENTER,
  zoom = 14,
  markers = [],
  fitToMarkers = false,
  onMarkerClick,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerObjsRef = useRef<naver.maps.Marker[]>([]);
  const listenersRef = useRef<naver.maps.MapEventListener[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 1) 지도 생성 — 한 번만
  useEffect(() => {
    let cancelled = false;

    loadNaverMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: new maps.LatLng(center.lat, center.lng),
          zoom,
          // 모바일에서 한 손가락 드래그는 지도 이동이어야 합니다.
          // 바텀시트와 겹치는 영역의 제스처 처리는 W3 에서 다시 봅니다.
          scaleControl: false,
          mapDataControl: false,
          // 좌하단에는 네이버 표기(법적 필수, 이동 불가)가 고정으로 붙습니다.
          // 로고 컨트롤까지 거기 두면 겹치므로 우하단으로 보냅니다.
          logoControlOptions: { position: maps.Position.BOTTOM_RIGHT },
        });
        setReady(true);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
    // center·zoom 은 최초 값만 씁니다. 이후 이동은 아래 effect 가 담당합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) center 변경 반영
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
  }, [center.lat, center.lng, ready]);

  // 3) 마커 동기화 — 이전 마커를 지우고 다시 그립니다.
  //    한 코스에 최대 7개(MAX_COURSE_PLACES)라 diff 를 계산할 이유가 없습니다.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    for (const l of listenersRef.current) naver.maps.Event.removeListener(l);
    for (const m of markerObjsRef.current) m.setMap(null);
    listenersRef.current = [];
    markerObjsRef.current = [];

    for (const m of markers) {
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(m.position.lat, m.position.lng),
        title: m.label,
        icon: {
          content: markerHtml(m.order),
          // 마커의 '뾰족한 끝'이 좌표를 가리키도록 기준점을 아래 중앙으로 옮깁니다.
          anchor: new naver.maps.Point(14, 34),
        },
      });
      markerObjsRef.current.push(marker);

      if (onMarkerClick) {
        listenersRef.current.push(
          naver.maps.Event.addListener(marker, "click", () => onMarkerClick(m.id)),
        );
      }
    }

    if (fitToMarkers && markers.length > 0) {
      if (markers.length === 1) {
        map.setCenter(new naver.maps.LatLng(markers[0].position.lat, markers[0].position.lng));
      } else {
        const bounds = new naver.maps.LatLngBounds(
          new naver.maps.LatLng(markers[0].position.lat, markers[0].position.lng),
          new naver.maps.LatLng(markers[0].position.lat, markers[0].position.lng),
        );
        for (const m of markers) {
          bounds.extend(new naver.maps.LatLng(m.position.lat, m.position.lng));
        }
        map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
      }
    }

    return () => {
      for (const l of listenersRef.current) naver.maps.Event.removeListener(l);
      for (const mk of markerObjsRef.current) mk.setMap(null);
      listenersRef.current = [];
      markerObjsRef.current = [];
    };
  }, [markers, fitToMarkers, onMarkerClick, ready]);

  if (error) {
    return (
      <div
        className={className}
        style={{
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "var(--jd-surface)",
          border: "1px solid var(--jd-border)",
          color: "var(--jd-text-muted)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          textAlign: "center",
        }}
        role="alert"
      >
        <div>
          <p style={{ color: "var(--jd-danger)", fontWeight: 600, marginBottom: "0.5rem" }}>
            지도를 불러오지 못했습니다
          </p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ background: "var(--jd-surface)" }}
      role="application"
      aria-label="지도"
    />
  );
}

/**
 * 마커 아이콘.
 *
 * 브랜드 규칙상 **상태를 색만으로 전달하지 않습니다** — 순번을 숫자로 함께 찍습니다.
 * 숫자는 등폭(`--jd-font-mono` → `.jd-num`)입니다.
 */
function markerHtml(order?: number): string {
  const body =
    order === undefined
      ? ""
      : `<span style="font:600 12px/1 var(--jd-font-mono,monospace);color:var(--jd-steel-950);font-variant-numeric:tabular-nums">${order + 1}</span>`;

  return `
<div style="
  width:28px;height:28px;display:grid;place-items:center;
  background:var(--jd-accent-glow);
  border:2px solid var(--jd-steel-950);
  clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);
  box-shadow:0 2px 6px rgb(0 0 0 / 0.35);
">${body}</div>`.trim();
}
