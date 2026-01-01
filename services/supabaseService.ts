
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwutxitkyzpauqonszbv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CPsh0GqAix79aZnbgyK89A_t1g2kyhk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
