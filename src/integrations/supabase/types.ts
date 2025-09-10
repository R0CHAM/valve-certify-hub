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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          aprovado_em: string | null
          aprovador_id: string | null
          certificado_gerado: boolean | null
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          numero_certificado: string | null
          numero_os: string
          observacoes_escritorio: string | null
          observacoes_tecnico: string | null
          status: Database["public"]["Enums"]["service_status"] | null
          tecnico_id: string | null
          tipo_servico: string
          updated_at: string | null
          valvula_id: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          certificado_gerado?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          numero_certificado?: string | null
          numero_os: string
          observacoes_escritorio?: string | null
          observacoes_tecnico?: string | null
          status?: Database["public"]["Enums"]["service_status"] | null
          tecnico_id?: string | null
          tipo_servico: string
          updated_at?: string | null
          valvula_id?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          certificado_gerado?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          numero_certificado?: string | null
          numero_os?: string
          observacoes_escritorio?: string | null
          observacoes_tecnico?: string | null
          status?: Database["public"]["Enums"]["service_status"] | null
          tecnico_id?: string | null
          tipo_servico?: string
          updated_at?: string | null
          valvula_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_valvula_id_fkey"
            columns: ["valvula_id"]
            isOneToOne: false
            referencedRelation: "valvulas"
            referencedColumns: ["id"]
          },
        ]
      }
      plantas: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          endereco: string | null
          id: string
          nome: string
          responsavel_email: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          nome: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plantas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          empresa_id: string | null
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          empresa_id?: string | null
          id: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      valvulas: {
        Row: {
          created_at: string | null
          diametro: string | null
          empresa_id: string | null
          fabricante: string | null
          fluido: string | null
          id: string
          localizacao: string | null
          material_corpo: string | null
          material_internos: string | null
          modelo: string | null
          numero_serie: string | null
          observacoes: string | null
          periodicidade_meses: number | null
          planta_id: string | null
          pressao_abertura: number | null
          pressao_fechamento: number | null
          proxima_inspecao: string | null
          qr_code: string | null
          status: Database["public"]["Enums"]["valve_status"] | null
          tag: string
          temperatura_operacao: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diametro?: string | null
          empresa_id?: string | null
          fabricante?: string | null
          fluido?: string | null
          id?: string
          localizacao?: string | null
          material_corpo?: string | null
          material_internos?: string | null
          modelo?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          periodicidade_meses?: number | null
          planta_id?: string | null
          pressao_abertura?: number | null
          pressao_fechamento?: number | null
          proxima_inspecao?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["valve_status"] | null
          tag: string
          temperatura_operacao?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diametro?: string | null
          empresa_id?: string | null
          fabricante?: string | null
          fluido?: string | null
          id?: string
          localizacao?: string | null
          material_corpo?: string | null
          material_internos?: string | null
          modelo?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          periodicidade_meses?: number | null
          planta_id?: string | null
          pressao_abertura?: number | null
          pressao_fechamento?: number | null
          proxima_inspecao?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["valve_status"] | null
          tag?: string
          temperatura_operacao?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valvulas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valvulas_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "plantas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_qr_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_empresa: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      service_status:
        | "pendente"
        | "em_andamento"
        | "aguardando_aprovacao"
        | "aprovado"
        | "rejeitado"
      user_role: "admin" | "tecnico" | "escritorio" | "cliente"
      valve_status: "ativa" | "inativa" | "manutencao"
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
    Enums: {
      service_status: [
        "pendente",
        "em_andamento",
        "aguardando_aprovacao",
        "aprovado",
        "rejeitado",
      ],
      user_role: ["admin", "tecnico", "escritorio", "cliente"],
      valve_status: ["ativa", "inativa", "manutencao"],
    },
  },
} as const
