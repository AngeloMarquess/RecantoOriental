import { createAdminClient } from '../utils/supabase/admin';

async function fixProfiles() {
  const supabase = createAdminClient();
  
  // 1. Get all users from auth.users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  console.log(`Found ${users.length} users in auth.users.`);
  
  let fixedCount = 0;
  
  // 2. Ensure each has a profile
  for (const user of users) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (!profile) {
      console.log(`User ${user.email} (${user.id}) is missing a profile. Creating one...`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Usuário Cliente',
          role: 'customer' // Make sure they are customer initially, or we can check email
        });
        
      if (insertError) {
        console.error(`Failed to create profile for ${user.id}:`, insertError);
      } else {
        console.log(`✅ Created profile for ${user.email}`);
        fixedCount++;
      }
    }
  }
  
  console.log(`Done! Fixed ${fixedCount} missing profiles.`);
}

fixProfiles();
