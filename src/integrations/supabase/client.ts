// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sqeihdvfbinuuazoyeqb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZWloZHZmYmludXVhem95ZXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTI0NjEsImV4cCI6MjA2NTU2ODQ2MX0.qM2BdV4KZtNxlsb6zlFVBEfhZm_kQSNO2uK1LBs70YE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);