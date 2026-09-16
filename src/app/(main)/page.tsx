"use client";

import { useCallback, useMemo, useState } from "react";

import { NaverMap, type MapMarker } from "@/components/map/NaverMap";
import { Button } from "@/components/ui/button";
import { DEFAULT_CENTER, type LatLng } from "@/types/geo";

/**
 * 임시 지도 확인 화면.
 *
 * ⚠️ W2 에 **S1 코스 목록**으로 교체됩니다 (UI 플로우 §6).
 * 지금은 검색·코스 CRUD 가 없어서 지도가 도는지만 봅니다.
 */

/** 확인용 고정 좌표 — 성수동 일대 */
const SAMPLE: { id: string; label: string; position: LatLng }[] = [
  { id: "a", label: "서울숲", position: { lat: 37.5444, lng: 127.0374 } },
  { id: "b", label: "성수동 카페거리", position: { lat: 37.5447, lng: 127.0557 } },
  { id: "c", label: "뚝섬유원지", position: { lat: 37.5311, lng: 127.0668 } },
];

export default function Page() {
  const [useSample, setUseSample] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [myLocation, setMyLocation] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const markers = useMemo<MapMarker[]>(() => {
    const base = useSample
      ? SAMPLE.map((s, i) => ({ id: s.id, position: s.position, order: i, label: s.label }))
      : [];
    return myLocation ? [...base, { id: "me", position: myLocation, label: "현재 위치" }] : base;
  }, [useSample, myLocation]);

  const handleMarkerClick = useCallback((id: string) => setSelected(id), []);

  const locate = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("이 브라우저는 위치 기능을 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "위치 권한이 거부됐습니다. 서울시청을 기준으로 표시합니다."
            : `위치를 가져오지 못했습니다 (${err.message})`,
        ),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const selectedPlace = SAMPLE.find((s) => s.id === selected);

  return (
    <>
      <div className="border-border bg-surface flex flex-wrap items-center gap-2 border-b px-5 py-2">
        <span className="text-text-muted mr-auto text-xs">W1 · 지도 렌더링 확인</span>
        <Button size="sm" onClick={() => setUseSample((v) => !v)}>
          샘플 마커 {useSample ? "숨기기" : "보기"}
        </Button>
        <Button size="sm" onClick={locate}>
          현재 위치
        </Button>
      </div>

      <NaverMap
        markers={markers}
        fitToMarkers
        center={myLocation ?? DEFAULT_CENTER}
        onMarkerClick={handleMarkerClick}
        className="jd-map"
      />

      <footer
        className="border-border bg-surface text-text-muted min-h-12 border-t px-5 py-3 text-sm"
        aria-live="polite"
      >
        {geoError ? (
          <span className="text-attention">{geoError}</span>
        ) : selectedPlace ? (
          <>
            선택: <strong className="text-text">{selectedPlace.label}</strong>{" "}
            <span className="jd-num">
              ({selectedPlace.position.lat.toFixed(5)}, {selectedPlace.position.lng.toFixed(5)})
            </span>
          </>
        ) : (
          "마커를 눌러보세요."
        )}
      </footer>
    </>
  );
}
