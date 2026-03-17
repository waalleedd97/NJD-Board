export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          name_ar: string;
          role: 'admin' | 'employee';
          avatar: string;
          phone: string | null;
          status: 'available' | 'busy' | 'away';
          workload: number;
          skills: string[];
          skills_ar: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          description: string;
          description_ar: string;
          progress: number;
          color: string;
          status: 'active' | 'on-hold' | 'completed';
          start_date: string;
          end_date: string;
          tags: string[];
          tags_ar: string[];
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          title_ar: string;
          description: string;
          description_ar: string;
          status: 'todo' | 'in-progress' | 'review' | 'done';
          priority: 'low' | 'medium' | 'high' | 'critical';
          assignee_id: string;
          project_id: string;
          sprint_id: string | null;
          tags: string[];
          tags_ar: string[];
          due_date: string;
          story_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      sprints: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          status: 'planning' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          goals: string[];
          goals_ar: string[];
          velocity: number;
          total_points: number;
          completed_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sprints']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sprints']['Insert']>;
      };
      design_items: {
        Row: {
          id: string;
          title: string;
          title_ar: string;
          type: 'ui' | '3d-model' | 'animation' | 'concept-art' | 'icon' | 'texture';
          status: 'draft' | 'in-review' | 'approved' | 'revision';
          assignee_id: string;
          project_id: string;
          thumbnail: string;
          version: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['design_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['design_items']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'task' | 'mention' | 'sprint' | 'system' | 'invite';
          title: string;
          title_ar: string;
          message: string;
          message_ar: string;
          avatar: string | null;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'employee';
          invited_by: string;
          status: 'pending' | 'accepted' | 'expired';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invitations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['invitations']['Insert']>;
      };
      project_members: {
        Row: {
          project_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_members']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_members']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
