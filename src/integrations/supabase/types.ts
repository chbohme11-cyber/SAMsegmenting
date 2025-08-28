export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used_at: string | null
          name: string
          organization_id: string | null
          permissions: Json | null
          rate_limit_rpm: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used_at?: string | null
          name: string
          organization_id?: string | null
          permissions?: Json | null
          rate_limit_rpm?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string | null
          permissions?: Json | null
          rate_limit_rpm?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string | null
          id: string
          operation: string
          operation_data: Json
          project_id: string
          undo_available: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          operation: string
          operation_data: Json
          project_id: string
          undo_available?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          operation?: string
          operation_data?: Json
          project_id?: string
          undo_available?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      inpaint_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          latency_ms: number | null
          mask_uri: string
          metadata: Json | null
          model: string
          negative_prompt: string | null
          project_id: string
          prompt: string
          result_uri: string | null
          seed: number
          src_image_uri: string
          status: string | null
          strength: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          mask_uri: string
          metadata?: Json | null
          model: string
          negative_prompt?: string | null
          project_id: string
          prompt: string
          result_uri?: string | null
          seed: number
          src_image_uri: string
          status?: string | null
          strength?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          mask_uri?: string
          metadata?: Json | null
          model?: string
          negative_prompt?: string | null
          project_id?: string
          prompt?: string
          result_uri?: string | null
          seed?: number
          src_image_uri?: string
          status?: string | null
          strength?: number | null
        }
        Relationships: []
      }
      masks: {
        Row: {
          area: number
          bbox: Json
          color: string | null
          created_at: string | null
          format: string | null
          id: string
          labels: Json | null
          project_id: string
          raw_data: Json | null
          rle_data: Json
          score: number | null
          version: number | null
        }
        Insert: {
          area: number
          bbox: Json
          color?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          labels?: Json | null
          project_id: string
          raw_data?: Json | null
          rle_data: Json
          score?: number | null
          version?: number | null
        }
        Update: {
          area?: number
          bbox?: Json
          color?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          labels?: Json | null
          project_id?: string
          raw_data?: Json | null
          rle_data?: Json
          score?: number | null
          version?: number | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          rate_limit_rpm: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          rate_limit_rpm?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          rate_limit_rpm?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      paint_layers: {
        Row: {
          blend_mode: string | null
          created_at: string | null
          id: string
          layer_order: number | null
          metadata: Json | null
          project_id: string
          strokes: Json | null
        }
        Insert: {
          blend_mode?: string | null
          created_at?: string | null
          id?: string
          layer_order?: number | null
          metadata?: Json | null
          project_id: string
          strokes?: Json | null
        }
        Update: {
          blend_mode?: string | null
          created_at?: string | null
          id?: string
          layer_order?: number | null
          metadata?: Json | null
          project_id?: string
          strokes?: Json | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          completed_at: string | null
          cost_cents: number | null
          created_at: string | null
          id: string
          idempotency_key: string
          latency_ms: number | null
          metadata: Json | null
          model_version: string
          provider: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          idempotency_key: string
          latency_ms?: number | null
          metadata?: Json | null
          model_version: string
          provider: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          idempotency_key?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_version?: string
          provider?: string
          status?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          image_height: number
          image_uri: string
          image_width: number
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_height: number
          image_uri: string
          image_width: number
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_height?: number
          image_uri?: string
          image_width?: number
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sam2_processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          error_message: string | null
          failed_at: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          original_image_name: string | null
          original_image_url: string
          processing_prompts: Json | null
          processing_time_ms: number | null
          project_id: string | null
          replicate_prediction_id: string | null
          session_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          failed_at?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_image_name?: string | null
          original_image_url: string
          processing_prompts?: Json | null
          processing_time_ms?: number | null
          project_id?: string | null
          replicate_prediction_id?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          failed_at?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_image_name?: string | null
          original_image_url?: string
          processing_prompts?: Json | null
          processing_time_ms?: number | null
          project_id?: string | null
          replicate_prediction_id?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sam2_processing_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sam2_processing_jobs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sam2_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sam2_segmentations: {
        Row: {
          area_pixels: number | null
          bounding_box: Json | null
          confidence_score: number | null
          created_at: string | null
          id: string
          mask_data: Json
          mask_id: string | null
          mask_url: string | null
          processing_job_id: string | null
          segmentation_index: number
        }
        Insert: {
          area_pixels?: number | null
          bounding_box?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          mask_data: Json
          mask_id?: string | null
          mask_url?: string | null
          processing_job_id?: string | null
          segmentation_index?: number
        }
        Update: {
          area_pixels?: number | null
          bounding_box?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          mask_data?: Json
          mask_id?: string | null
          mask_url?: string | null
          processing_job_id?: string | null
          segmentation_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "sam2_segmentations_mask_id_fkey"
            columns: ["mask_id"]
            isOneToOne: false
            referencedRelation: "masks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sam2_segmentations_processing_job_id_fkey"
            columns: ["processing_job_id"]
            isOneToOne: false
            referencedRelation: "sam2_processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sam2_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          session_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          session_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          session_key?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sam2_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
