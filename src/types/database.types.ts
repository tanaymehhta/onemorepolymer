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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string | null
          id: string
          Name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          Name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          Name?: string
        }
        Relationships: []
      }
      deals_1: {
        Row: {
          Company: string
          created_at: string | null
          Date: string
          Grade: string
          id: string
          Product: string
          "Purchase Party": string | null
          "Purchase Rate": number | null
          "Quantity Purchased": number | null
          "Quantity Sold": number
          "Sale Party": string
          "Sale Rate": number
          "Specific Grade": string
          SrNo: string
          updated_at: string | null
        }
        Insert: {
          Company: string
          created_at?: string | null
          Date: string
          Grade: string
          id?: string
          Product: string
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold": number
          "Sale Party": string
          "Sale Rate": number
          "Specific Grade": string
          SrNo: string
          updated_at?: string | null
        }
        Update: {
          Company?: string
          created_at?: string | null
          Date?: string
          Grade?: string
          id?: string
          Product?: string
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold"?: number
          "Sale Party"?: string
          "Sale Rate"?: number
          "Specific Grade"?: string
          SrNo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deals_2: {
        Row: {
          Company: string
          created_at: string | null
          Date: string
          Grade: string
          id: string
          Product: string
          "Purchase Party": string | null
          "Purchase Rate": number | null
          "Quantity Purchased": number | null
          "Quantity Sold": number
          "Sale Party": string
          "Sale Rate": number
          "Specific Grade": string
          SrNo: string
          updated_at: string | null
        }
        Insert: {
          Company: string
          created_at?: string | null
          Date: string
          Grade: string
          id?: string
          Product: string
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold": number
          "Sale Party": string
          "Sale Rate": number
          "Specific Grade": string
          SrNo: string
          updated_at?: string | null
        }
        Update: {
          Company?: string
          created_at?: string | null
          Date?: string
          Grade?: string
          id?: string
          Product?: string
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold"?: number
          "Sale Party"?: string
          "Sale Rate"?: number
          "Specific Grade"?: string
          SrNo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deals_3: {
        Row: {
          Company: string
          created_at: string | null
          Date: string
          Grade: string
          id: string
          Product: string
          "Purchase Party": string | null
          "Purchase Rate": number | null
          "Quantity Purchased": number | null
          "Quantity Sold": number
          "Sale Party": string
          "Sale Rate": number
          "Specific Grade": string
          SrNo: string
          updated_at: string | null
        }
        Insert: {
          Company: string
          created_at?: string | null
          Date: string
          Grade: string
          id?: string
          Product: string
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold": number
          "Sale Party": string
          "Sale Rate": number
          "Specific Grade": string
          SrNo: string
          updated_at?: string | null
        }
        Update: {
          Company?: string
          created_at?: string | null
          Date?: string
          Grade?: string
          id?: string
          Product?: string
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold"?: number
          "Sale Party"?: string
          "Sale Rate"?: number
          "Specific Grade"?: string
          SrNo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deals_unified: {
        Row: {
          Company: string | null
          created_at: string | null
          Date: string | null
          Grade: string | null
          id: string
          Product: string | null
          "Purchase Party": string | null
          "Purchase Rate": number | null
          "Quantity Purchased": number | null
          "Quantity Sold": number | null
          "Sale Party": string | null
          "Sale Rate": number | null
          "Specific Grade": string | null
          SrNo: string | null
          updated_at: string | null
        }
        Insert: {
          Company?: string | null
          created_at?: string | null
          Date?: string | null
          Grade?: string | null
          id: string
          Product?: string | null
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold"?: number | null
          "Sale Party"?: string | null
          "Sale Rate"?: number | null
          "Specific Grade"?: string | null
          SrNo?: string | null
          updated_at?: string | null
        }
        Update: {
          Company?: string | null
          created_at?: string | null
          Date?: string | null
          Grade?: string | null
          id?: string
          Product?: string | null
          "Purchase Party"?: string | null
          "Purchase Rate"?: number | null
          "Quantity Purchased"?: number | null
          "Quantity Sold"?: number | null
          "Sale Party"?: string | null
          "Sale Rate"?: number | null
          "Specific Grade"?: string | null
          SrNo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          check_type: string
          checked_at: string | null
          error_message: string | null
          id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status: string
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      message_outbox: {
        Row: {
          attempts: number | null
          created_at: string | null
          deal_id: string
          error_message: string | null
          external_message_id: string | null
          id: string
          max_attempts: number | null
          message_text: string
          platform: string
          recipient_phone: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          deal_id: string
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          max_attempts?: number | null
          message_text: string
          platform: string
          recipient_phone: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          deal_id?: string
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          max_attempts?: number | null
          message_text?: string
          platform?: string
          recipient_phone?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          platform: string
          template_text: string
          variables: Json | null
          whatsapp_template_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          platform: string
          template_text: string
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform?: string
          template_text?: string
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          Company: string
          created_at: string | null
          Grade: string
          id: string
          Product: string
          "Specific Grade": string
        }
        Insert: {
          Company: string
          created_at?: string | null
          Grade: string
          id?: string
          Product: string
          "Specific Grade": string
        }
        Update: {
          Company?: string
          created_at?: string | null
          Grade?: string
          id?: string
          Product?: string
          "Specific Grade"?: string
        }
        Relationships: []
      }
      sheets_sync_log: {
        Row: {
          created_at: string | null
          deal_id: string
          error_message: string | null
          id: string
          row_number: number | null
          sheet_id: string
          status: string | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          error_message?: string | null
          id?: string
          row_number?: number | null
          sheet_id: string
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          error_message?: string | null
          id?: string
          row_number?: number | null
          sheet_id?: string
          status?: string | null
          synced_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          created_at: string | null
          id: string
          Name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          Name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          Name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
