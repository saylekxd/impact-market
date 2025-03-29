import { supabase } from './supabase';
import { Database } from './database.types';
import { v4 as uuidv4 } from 'uuid';

// --- Export the Type --- 
export type DonationGoal = Database['public']['Tables']['donation_goals']['Row'];
// --- Keep other types internal if not needed elsewhere ---
type DonationGoalInsert = Database['public']['Tables']['donation_goals']['Insert'];
type DonationGoalUpdate = Database['public']['Tables']['donation_goals']['Update'];

// --- Export the Response Type --- 
export interface GoalResponse {
  success: boolean;
  data?: DonationGoal | DonationGoal[] | null;
  error?: string;
}

export const goals = {
  // Get all goals for a user
  async getByUserId(userId: string): Promise<GoalResponse> {
    try {
      const { data, error } = await supabase
        .from('donation_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching goals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // --- Add function to get the currently active goal --- 
  async getActiveGoalByUserId(userId: string): Promise<GoalResponse> {
    try {
      const { data, error } = await supabase
        .from('donation_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true) // Filter for active goals
        .order('created_at', { ascending: false }) // Get the latest active one if multiple exist (shouldn't happen ideally)
        .limit(1) // Only need one
        .maybeSingle(); // Return null if no active goal found, instead of error

      if (error) throw error;

      return {
        success: true,
        data: data // data will be the goal object or null
      };
    } catch (error) {
      console.error('Error fetching active goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },
  // --- End of new function ---

  // Create a new goal
  async create(goal: Omit<DonationGoalInsert, 'id'>): Promise<GoalResponse> {
    try {
      const newGoal = {
        ...goal,
        id: uuidv4(),
        current_amount: 0,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('donation_goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Update an existing goal
  async update(goalId: string, updates: DonationGoalUpdate): Promise<GoalResponse> {
    try {
      const { data, error } = await supabase
        .from('donation_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Delete a goal
  async delete(goalId: string): Promise<GoalResponse> {
    try {
      const { error } = await supabase
        .from('donation_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Update goal progress when a donation is received
  async updateProgress(goalId: string, amount: number): Promise<GoalResponse> {
    try {
      const { data: goal, error: fetchError } = await supabase
        .from('donation_goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const newAmount = (goal?.current_amount || 0) + amount;
      const isCompleted = newAmount >= (goal?.target_amount || 0);

      const { data, error: updateError } = await supabase
        .from('donation_goals')
        .update({
          current_amount: newAmount,
          active: !isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}; 