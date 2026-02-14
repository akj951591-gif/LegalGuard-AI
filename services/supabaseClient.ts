
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvcakrrbbaklvfaiuooc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y2FrcnJiYmFrbHZmYWl1b29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc5NDQsImV4cCI6MjA4NjYzMzk0NH0.BWM1ckV1j7IYvlKfodos4WKKBLq_l55shYhQh3ni_do';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
