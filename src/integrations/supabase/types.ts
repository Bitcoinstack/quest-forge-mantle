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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          id: string
          unlocked_at: string
          wallet_address: string
          xp_reward: number | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          id?: string
          unlocked_at?: string
          wallet_address: string
          xp_reward?: number | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          id?: string
          unlocked_at?: string
          wallet_address?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      chess_games: {
        Row: {
          ai_difficulty: string
          created_at: string
          fen_position: string
          game_result: string | null
          id: string
          is_player_turn: boolean | null
          move_history: Json | null
          player_color: string
          puzzles_solved: number | null
          session_id: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          ai_difficulty: string
          created_at?: string
          fen_position?: string
          game_result?: string | null
          id?: string
          is_player_turn?: boolean | null
          move_history?: Json | null
          player_color?: string
          puzzles_solved?: number | null
          session_id?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          ai_difficulty?: string
          created_at?: string
          fen_position?: string
          game_result?: string | null
          id?: string
          is_player_turn?: boolean | null
          move_history?: Json | null
          player_color?: string
          puzzles_solved?: number | null
          session_id?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "chess_games_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string
          description: string
          game_type: string
          id: string
          target_value: number
          xp_reward: number | null
        }
        Insert: {
          challenge_date?: string
          challenge_type: string
          created_at?: string
          description: string
          game_type: string
          id?: string
          target_value: number
          xp_reward?: number | null
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string
          game_type?: string
          id?: string
          target_value?: number
          xp_reward?: number | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          completed_at: string | null
          difficulty: string
          game_data: Json | null
          game_type: string
          id: string
          quest_id: number | null
          score: number | null
          stake_amount: number | null
          started_at: string
          status: string
          wallet_address: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          difficulty: string
          game_data?: Json | null
          game_type: string
          id?: string
          quest_id?: number | null
          score?: number | null
          stake_amount?: number | null
          started_at?: string
          status?: string
          wallet_address: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          difficulty?: string
          game_data?: Json | null
          game_type?: string
          id?: string
          quest_id?: number | null
          score?: number | null
          stake_amount?: number | null
          started_at?: string
          status?: string
          wallet_address?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          level: number | null
          total_games_played: number | null
          total_games_won: number | null
          total_xp: number | null
          updated_at: string
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number | null
          total_games_played?: number | null
          total_games_won?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number | null
          total_games_played?: number | null
          total_games_won?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      tower_defense_games: {
        Row: {
          created_at: string
          current_map: string
          current_wave: number | null
          game_result: string | null
          gold: number | null
          id: string
          lives: number | null
          session_id: string | null
          towers: Json | null
          unlocked_maps: Json | null
          unlocked_towers: Json | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          current_map?: string
          current_wave?: number | null
          game_result?: string | null
          gold?: number | null
          id?: string
          lives?: number | null
          session_id?: string | null
          towers?: Json | null
          unlocked_maps?: Json | null
          unlocked_towers?: Json | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          current_map?: string
          current_wave?: number | null
          game_result?: string | null
          gold?: number | null
          id?: string
          lives?: number | null
          session_id?: string | null
          towers?: Json | null
          unlocked_maps?: Json | null
          unlocked_towers?: Json | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tower_defense_games_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string
          current_progress: number | null
          id: string
          is_completed: boolean | null
          wallet_address: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          wallet_address: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          display_name: string | null
          level: number | null
          total_games_played: number | null
          total_games_won: number | null
          total_xp: number | null
          wallet_address: string | null
        }
        Relationships: []
      }
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
