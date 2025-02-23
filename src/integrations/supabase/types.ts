export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_analytics"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string | null
          file_url: string | null
          id: string
          sender_id: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          prescription_url: string | null
          rating: number | null
          status: string
          user_id: string
          vet_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          prescription_url?: string | null
          rating?: number | null
          status?: string
          user_id: string
          vet_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          prescription_url?: string | null
          rating?: number | null
          status?: string
          user_id?: string
          vet_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number
          created_at: string | null
          date: string
          description: string
          duration: number
          event_type: string | null
          id: string
          image_url: string
          location: string
          organizer_email: string | null
          organizer_id: string | null
          organizer_name: string | null
          organizer_phone: string | null
          organizer_website: string | null
          pet_requirements: string | null
          pet_types: string | null
          price: number
          status: string
          title: string
        }
        Insert: {
          capacity: number
          created_at?: string | null
          date: string
          description: string
          duration: number
          event_type?: string | null
          id?: string
          image_url: string
          location: string
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          pet_requirements?: string | null
          pet_types?: string | null
          price: number
          status?: string
          title: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          date?: string
          description?: string
          duration?: number
          event_type?: string | null
          id?: string
          image_url?: string
          location?: string
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          pet_requirements?: string | null
          pet_types?: string | null
          price?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vet_profiles: {
        Row: {
          address: string
          application_status:
            | Database["public"]["Enums"]["vet_application_status"]
            | null
          bio: string | null
          clinic_name: string
          contact_number: string
          created_at: string | null
          id: string
          license_number: string
          specializations: string[] | null
          user_id: string | null
          years_of_experience: number
        }
        Insert: {
          address: string
          application_status?:
            | Database["public"]["Enums"]["vet_application_status"]
            | null
          bio?: string | null
          clinic_name: string
          contact_number: string
          created_at?: string | null
          id?: string
          license_number: string
          specializations?: string[] | null
          user_id?: string | null
          years_of_experience: number
        }
        Update: {
          address?: string
          application_status?:
            | Database["public"]["Enums"]["vet_application_status"]
            | null
          bio?: string | null
          clinic_name?: string
          contact_number?: string
          created_at?: string | null
          id?: string
          license_number?: string
          specializations?: string[] | null
          user_id?: string | null
          years_of_experience?: number
        }
        Relationships: []
      }
    }
    Views: {
      event_analytics: {
        Row: {
          event_id: string | null
          price: number | null
          status: string | null
          tickets_sold: number | null
          title: string | null
          total_amount: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_vet: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      vet_application_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
