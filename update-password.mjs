import { createClient } from '@supabase/sdk';

const supabase = createClient(
  'https://app.pos-luddev.com',
  'ik_c85d1686e11524d8ca21097bd61c354e'
);

async function changeAdminPassword() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@barbershop.com',
    password: '123456',
  });

  if (error) {
    console.error('Error signing in:', error.message);
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: 'D@ta2026.'
  });

  if (updateError) {
    console.error('Error updating password:', updateError.message);
    process.exit(1);
  }

  console.log('Password updated successfully on https://app.pos-luddev.com');
}

changeAdminPassword();
