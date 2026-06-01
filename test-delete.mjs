import { createClient } from '@insforge/sdk';

const insforge = createClient(
  'https://app.pos-luddev.com',
  'ik_c85d1686e11524d8ca21097bd61c354e'
);

async function testDelete() {
  const { data: outlets } = await insforge.database.from('outlets').select('id').limit(1);
  const outletId = outlets[0]?.id;
  
  if (outletId) {
    const res1 = await insforge.database.from('transactions').delete().eq('outlet_id', outletId);
    console.log('Delete transactions:', res1);
    
    const res2 = await insforge.database.from('shifts').delete().eq('outlet_id', outletId);
    console.log('Delete shifts:', res2);
  }
}

testDelete();
