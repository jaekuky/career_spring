// ============================================================
// Supabase Database Types
// 자동생성 형식과 동일한 구조 (supabase gen types typescript)
// Schema: public
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          subscription_status: 'free' | 'premium' | 'cancelled';
          subscription_started_at: string | null;
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          subscription_status?: 'free' | 'premium' | 'cancelled';
          subscription_started_at?: string | null;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subscription_status?: 'free' | 'premium' | 'cancelled';
          subscription_started_at?: string | null;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      analysis_requests: {
        Row: {
          id: string;
          user_id: string;
          job_title: string;
          years_of_experience: number;
          skills: string[];
          achievements: string | null;
          education: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_title: string;
          years_of_experience: number;
          skills: string[];
          achievements?: string | null;
          education: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_title?: string;
          years_of_experience?: number;
          skills?: string[];
          achievements?: string | null;
          education?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analysis_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      analysis_results: {
        Row: {
          id: string;
          request_id: string;
          user_id: string;
          salary_min: number;
          salary_mid: number;
          salary_max: number;
          company_types: Json;
          strengths: Json;
          sample_size: number;
          confidence_score: number;
          raw_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          user_id: string;
          salary_min: number;
          salary_mid: number;
          salary_max: number;
          company_types?: Json;
          strengths?: Json;
          sample_size: number;
          confidence_score: number;
          raw_response?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          user_id?: string;
          salary_min?: number;
          salary_mid?: number;
          salary_max?: number;
          company_types?: Json;
          strengths?: Json;
          sample_size?: number;
          confidence_score?: number;
          raw_response?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analysis_results_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: true;
            referencedRelation: 'analysis_requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'analysis_results_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          payment_key: string | null;
          order_id: string;
          amount: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
          billing_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          payment_key?: string | null;
          order_id: string;
          amount: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'failed';
          billing_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          payment_key?: string | null;
          order_id?: string;
          amount?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'failed';
          billing_key?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          result_id: string;
          rating: 'positive' | 'negative';
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          result_id: string;
          rating: 'positive' | 'negative';
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          result_id?: string;
          rating?: 'positive' | 'negative';
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_result_id_fkey';
            columns: ['result_id'];
            isOneToOne: false;
            referencedRelation: 'analysis_results';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ============================================================
// 편의 타입 (Row 타입 shorthand)
// ============================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AnalysisRequest = Database['public']['Tables']['analysis_requests']['Row'];
export type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type AnalysisRequestInsert = Database['public']['Tables']['analysis_requests']['Insert'];
export type AnalysisResultInsert = Database['public']['Tables']['analysis_results']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
