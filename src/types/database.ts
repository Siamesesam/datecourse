/**
 * Supabase 스키마의 TypeScript 표현.
 *
 * 단일 원본은 `supabase/migrations/` 의 SQL 입니다.
 * 마이그레이션을 추가하면 이 파일도 같이 고칩니다 — 안 고치면 타입이 조용히 거짓말을 합니다.
 *
 * 근거: projects/01-datecourse/docs/03-data-model.md
 */

export type TravelMode = "car" | "transit" | "walk";
export type PlaceProvider = "kakao" | "naver";

/** DB 가 default 를 채워주는 컬럼은 Insert 에서 선택입니다. */
export interface Database {
  public: {
    Tables: {
      course: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          course_date: string | null;
          start_at: string | null;
          travel_mode: TravelMode;
          share_token: string;
          share_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          course_date?: string | null;
          start_at?: string | null;
          travel_mode?: TravelMode;
          share_token?: string;
          share_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["course"]["Insert"]>;
      };

      place: {
        Row: {
          id: string; // "{provider}:{providerId}"
          provider: PlaceProvider;
          name: string;
          category: string | null;
          address: string | null;
          road_address: string | null;
          lat: number;
          lng: number;
          phone: string | null;
          url: string | null;
          fetched_at: string;
        };
        Insert: {
          id: string;
          provider: PlaceProvider;
          name: string;
          category?: string | null;
          address?: string | null;
          road_address?: string | null;
          lat: number;
          lng: number;
          phone?: string | null;
          url?: string | null;
          fetched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["place"]["Insert"]>;
      };

      course_item: {
        Row: {
          id: string;
          course_id: string;
          place_id: string | null;
          position: number;
          stay_min: number;
          budget: number;
          memo: string | null;
          snap_name: string;
          snap_address: string | null;
          snap_lat: number;
          snap_lng: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          place_id?: string | null;
          position: number;
          stay_min?: number;
          budget?: number;
          memo?: string | null;
          snap_name: string;
          snap_address?: string | null;
          snap_lat: number;
          snap_lng: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["course_item"]["Insert"]>;
      };

      comment: {
        Row: {
          id: string;
          course_id: string;
          item_id: string | null;
          author_id: string | null;
          guest_name: string | null;
          body: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          item_id?: string | null;
          author_id?: string | null;
          guest_name?: string | null;
          body?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comment"]["Insert"]>;
      };

      /** ⚠️ 서버 전용 — RLS 정책이 없어 secret key 로만 접근됩니다. */
      directions_cache: {
        Row: {
          cache_key: string;
          response: unknown;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          cache_key: string;
          response: unknown;
          created_at?: string;
          expires_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["directions_cache"]["Insert"]>;
      };

      /** ⚠️ 서버 전용 — RLS 정책이 없어 secret key 로만 접근됩니다. */
      api_call_counter: {
        Row: {
          day: string;
          provider: string;
          count: number;
        };
        Insert: {
          day: string;
          provider: string;
          count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["api_call_counter"]["Insert"]>;
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}

/** 자주 쓰는 Row 별칭 */
export type CourseRow = Database["public"]["Tables"]["course"]["Row"];
export type PlaceRow = Database["public"]["Tables"]["place"]["Row"];
export type CourseItemRow = Database["public"]["Tables"]["course_item"]["Row"];
export type CommentRow = Database["public"]["Tables"]["comment"]["Row"];
