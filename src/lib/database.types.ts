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
          available_balance: number;
          total_donations: number;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          available_balance?: number;
          total_donations?: number;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          available_balance?: number;
          total_donations?: number;
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
        };
      };
      bank_accounts: {
        Row: {
          id: string;
          user_id: string;
          account_number: string;
          bank_name: string;
          swift_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_number: string;
          bank_name: string;
          swift_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_number?: string;
          bank_name?: string;
          swift_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payouts: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: string;
          bank_account_id: string;
          created_at: string;
          processed_at: string | null;
          admin_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: string;
          bank_account_id: string;
          created_at?: string;
          processed_at?: string | null;
          admin_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          status?: string;
          bank_account_id?: string;
          created_at?: string;
          processed_at?: string | null;
          admin_id?: string | null;
        };
      };
    };
  };
}