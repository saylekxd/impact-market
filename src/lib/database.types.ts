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
          small_coffee_amount: number;
          medium_coffee_amount: number;
          large_coffee_amount: number;
          small_icon: string;
          medium_icon: string;
          large_icon: string;
          social_links: Record<string, string> | null;
          organization_history: string | null;
          organization_mission: string | null;
          organization_photos: string[] | null;
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
          small_coffee_amount?: number;
          medium_coffee_amount?: number;
          large_coffee_amount?: number;
          small_icon?: string;
          medium_icon?: string;
          large_icon?: string;
          social_links?: Record<string, string> | null;
          organization_history?: string | null;
          organization_mission?: string | null;
          organization_photos?: string[] | null;
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
          small_coffee_amount?: number;
          medium_coffee_amount?: number;
          large_coffee_amount?: number;
          small_icon?: string;
          medium_icon?: string;
          large_icon?: string;
          social_links?: Record<string, string> | null;
          organization_history?: string | null;
          organization_mission?: string | null;
          organization_photos?: string[] | null;
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
      payout_logs: {
        Row: {
          id: string;
          payout_id: string;
          action: string;
          details: Record<string, any>;
          performed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          payout_id: string;
          action: string;
          details?: Record<string, any>;
          performed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          payout_id?: string;
          action?: string;
          details?: Record<string, any>;
          performed_by?: string;
          created_at?: string;
        };
      };
      user_verifications: {
        Row: {
          user_id: string;
          kyc_status: string;
          kyc_reference: string | null;
          kyc_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          kyc_status?: string;
          kyc_reference?: string | null;
          kyc_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          kyc_status?: string;
          kyc_reference?: string | null;
          kyc_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      donation_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          target_amount: number;
          current_amount: number;
          start_date: string;
          end_date: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          target_amount: number;
          current_amount?: number;
          start_date: string;
          end_date: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          target_amount?: number;
          current_amount?: number;
          start_date?: string;
          end_date?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          category: string;
          status: string;
          uploaded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          category: string;
          status?: string;
          uploaded_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          category?: string;
          status?: string;
          uploaded_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}