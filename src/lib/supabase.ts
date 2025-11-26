import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryqoqrxtxucgshdbkvvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cW9xcnh0eHVjZ3NoZGJrdnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTU2OTUsImV4cCI6MjA3OTY3MTY5NX0.cYsStax-IJV8k0B_2ybKayc03TBbhdo2hUr3-TbO6ZM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: string;
          initials: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          initials: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          initials?: string;
        };
      };
      content: {
        Row: {
          id: string;
          title: string;
          description: string;
          channel: string;
          owner_id: string;
          publish_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          channel: string;
          owner_id: string;
          publish_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          channel?: string;
          owner_id?: string;
          publish_date?: string;
          created_at?: string;
        };
      };
    };
  };
}
