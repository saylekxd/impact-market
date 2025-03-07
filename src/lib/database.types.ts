export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          total_donations: number;
          available_balance: number;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          total_donations?: number;
          available_balance?: number;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          total_donations?: number;
          available_balance?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          creator_id: string;
          amount: number;
          currency: string;
          status: string;
          message: string | null;
          payer_name: string | null;
          payer_email: string | null;
          created_at: string;
          payment_type: string | null;
        };
        Insert: {
          id?: string;
          creator_id: string;
          amount: number;
          currency?: string;
          status?: string;
          message?: string | null;
          payer_name?: string | null;
          payer_email?: string | null;
          created_at?: string;
          payment_type?: string | null;
        };
        Update: {
          id?: string;
          creator_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          message?: string | null;
          payer_name?: string | null;
          payer_email?: string | null;
          created_at?: string;
          payment_type?: string | null;
        };
      };
    };
  };
}