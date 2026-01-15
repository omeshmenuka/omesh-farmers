
import { createClient } from '@supabase/supabase-js';

// Updated Project Configuration from user request
const SUPABASE_URL = 'https://feyjrcvxyzkzsujeacdo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_StuNJr6FmkymG_tWPuXKnw_aeklPA8g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkSupabaseConnection = async () => {
  try {
    // Basic connectivity check to the farmers table
    const { error } = await supabase.from('farmers').select('id').limit(1);
    
    if (error) {
      console.warn("Supabase connectivity check failed:", error.message);
      return { connected: false, error: error.message };
    }
    
    return { connected: true, error: null };
  } catch (err: any) {
    return { connected: false, error: err.message || "Unknown connection error" };
  }
};
