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
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          payment_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_id?: string | null
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
      groomer_bank_details: {
        Row: {
          account_name: string
          account_number: string
          created_at: string | null
          groomer_id: string
          id: string
          ifsc_code: string
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string | null
          groomer_id: string
          id?: string
          ifsc_code: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string | null
          groomer_id?: string
          id?: string
          ifsc_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groomer_bank_details_groomer_id_fkey"
            columns: ["groomer_id"]
            isOneToOne: true
            referencedRelation: "groomer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groomer_payouts: {
        Row: {
          amount: number
          created_at: string | null
          groomer_id: string
          id: string
          notes: string | null
          processed_at: string | null
          status: string
          updated_at: string | null
          week_end: string | null
          week_start: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          groomer_id: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          groomer_id?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groomer_payouts_groomer_id_fkey"
            columns: ["groomer_id"]
            isOneToOne: false
            referencedRelation: "groomer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groomer_profiles: {
        Row: {
          address: string
          admin_notes: string | null
          application_status:
            | Database["public"]["Enums"]["groomer_status"]
            | null
          bio: string | null
          contact_number: string
          created_at: string | null
          experience_years: number
          home_service_cost: number | null
          id: string
          is_available: boolean | null
          price: number | null
          profile_image_url: string | null
          provides_home_service: boolean | null
          provides_salon_service: boolean | null
          salon_name: string
          specializations: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          application_status?:
            | Database["public"]["Enums"]["groomer_status"]
            | null
          bio?: string | null
          contact_number: string
          created_at?: string | null
          experience_years: number
          home_service_cost?: number | null
          id?: string
          is_available?: boolean | null
          price?: number | null
          profile_image_url?: string | null
          provides_home_service?: boolean | null
          provides_salon_service?: boolean | null
          salon_name: string
          specializations: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          application_status?:
            | Database["public"]["Enums"]["groomer_status"]
            | null
          bio?: string | null
          contact_number?: string
          created_at?: string | null
          experience_years?: number
          home_service_cost?: number | null
          id?: string
          is_available?: boolean | null
          price?: number | null
          profile_image_url?: string | null
          provides_home_service?: boolean | null
          provides_salon_service?: boolean | null
          salon_name?: string
          specializations?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      groomer_time_slots: {
        Row: {
          created_at: string | null
          date: string
          groomer_id: string
          times: string[]
        }
        Insert: {
          created_at?: string | null
          date: string
          groomer_id: string
          times?: string[]
        }
        Update: {
          created_at?: string | null
          date?: string
          groomer_id?: string
          times?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "groomer_time_slots_groomer_id_fkey"
            columns: ["groomer_id"]
            isOneToOne: false
            referencedRelation: "groomer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grooming_bookings: {
        Row: {
          additional_cost: number | null
          created_at: string | null
          date: string
          groomer_id: string | null
          home_address: string | null
          id: string
          package_id: string | null
          payment_id: string | null
          pet_details: string | null
          service_type: string
          status: string | null
          time: string
          user_id: string
        }
        Insert: {
          additional_cost?: number | null
          created_at?: string | null
          date: string
          groomer_id?: string | null
          home_address?: string | null
          id?: string
          package_id?: string | null
          payment_id?: string | null
          pet_details?: string | null
          service_type: string
          status?: string | null
          time: string
          user_id: string
        }
        Update: {
          additional_cost?: number | null
          created_at?: string | null
          date?: string
          groomer_id?: string | null
          home_address?: string | null
          id?: string
          package_id?: string | null
          payment_id?: string | null
          pet_details?: string | null
          service_type?: string
          status?: string | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grooming_bookings_groomer_id_fkey"
            columns: ["groomer_id"]
            isOneToOne: false
            referencedRelation: "groomer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grooming_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "grooming_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      grooming_packages: {
        Row: {
          created_at: string
          description: string
          groomer_id: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description: string
          groomer_id: string
          id?: string
          name: string
          price?: number
        }
        Update: {
          created_at?: string
          description?: string
          groomer_id?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "grooming_packages_groomer_id_fkey"
            columns: ["groomer_id"]
            isOneToOne: false
            referencedRelation: "groomer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          created_at: string | null
          description: string
          email: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          email: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          email?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          page: string
          title: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          page: string
          title?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          page?: string
          title?: string | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          account_name: string
          account_number: string
          amount: number | null
          created_at: string | null
          event_id: string
          id: string
          ifsc_code: string
          organizer_id: string
          processed_at: string | null
          status: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount?: number | null
          created_at?: string | null
          event_id: string
          id?: string
          ifsc_code: string
          organizer_id: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number | null
          created_at?: string | null
          event_id?: string
          id?: string
          ifsc_code?: string
          organizer_id?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_analytics"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "payout_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
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
          is_online: boolean | null
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
          is_online?: boolean | null
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
          is_online?: boolean | null
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
      cleanup_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_simplified_payout_request:
        | {
            Args: {
              p_event_id: string
              p_organizer_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_event_id: string
              p_organizer_id: string
              p_account_name: string
              p_account_number: string
              p_ifsc_code: string
            }
            Returns: string
          }
      get_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_name: string
          file_name: string
        }[]
      }
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      insert_payout_request: {
        Args: {
          p_event_id: string
          p_organizer_id: string
          p_account_name: string
          p_account_number: string
          p_ifsc_code: string
          p_status?: string
        }
        Returns: string
      }
      is_groomer: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_vet: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      send_booking_confirmation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      groomer_status: "pending" | "approved" | "rejected"
      page_type: "events" | "home" | "vets" | "groomers"
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
