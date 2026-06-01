import { createClient } from '@insforge/sdk';

const insforge = createClient(
  'https://yhzh88c5.ap-southeast.insforge.app',
  'ik_c85d1686e11524d8ca21097bd61c354e'
);

async function setupAdmin() {
  console.log('Signing up admin user...');
  const { data, error } = await insforge.auth.signUp({
    email: 'admin@barbershop.com',
    password: 'D@ta2026',
  });
  
  if (error) {
    console.error('Error signing up:', error);
    process.exit(1);
  }
  
  console.log('User created:', data.user.id);
  
  // We need to fetch the default outlet
  const { data: outlets, error: outletError } = await insforge.from('outlets').select('id').limit(1);
  if (outletError || !outlets || outlets.length === 0) {
    console.error('Error fetching outlet:', outletError);
    process.exit(1);
  }
  
  console.log('Outlet found:', outlets[0].id);
  
  // Insert profile
  const { error: profileError } = await insforge.from('profiles').insert([
    { id: data.user.id, name: 'Admin Barbershop', role: 'admin', outlet_id: outlets[0].id }
  ]);
  
  if (profileError) {
    console.error('Error creating profile:', profileError);
    process.exit(1);
  }
  
  console.log('Admin profile created successfully!');
}

setupAdmin();
