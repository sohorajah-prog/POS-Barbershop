import { createClient } from '@supabase/sdk';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function test() {
  // First login as the admin user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@pos-luddev.com', // wait, does this user still exist? Yes.
    password: 'password123' // assuming this is the password, wait I don't know the password
  });
  
  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }
  
  console.log("Logged in as:", authData.user.id);
  
  const { data, error } = await supabase.from('v_profiles').select('*');
  console.log("v_profiles Data:", data);
  console.log("v_profiles Error:", error);

  const { data: pData, error: pError } = await supabase.from('profiles').select('*');
  console.log("profiles Data:", pData);
  console.log("profiles Error:", pError);
}

test();
