
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Pass via env var or hardcode for this run if needed, but script expects env
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('Seeding Admin User...');

    const adminId = '00000000-0000-0000-0000-000000000000';
    const email = 'admin@deposito626.com';
    const password = 'Yz6vxc@3';

    // 1. Create User
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' } // Optional but good
    });

    if (userError) {
        console.log('User creation error (might already exist):', userError.message);
    } else {
        console.log('User created:', user.user.id);
    }

    // Note: createUser generates a new ID. If I want a specific ID, I might not be able to force it via admin.createUser easily without raw SQL or update.
    // But for local dev I don't STRICTLY need that specific UUID, unless other things reference it.
    // seed.sql uses 0000... 
    // If I use the generated ID, I just need to update profiles with that ID.

    // Let's see if we can update the ID or just use the one we got.
    // Actually, let's just use the ID we got (or find the existing user).

    const { data: listUsers } = await supabase.auth.admin.listUsers();
    const adminUser = listUsers.users.find(u => u.email === email);

    if (!adminUser) {
        console.error("Failed to find admin user after creation attempt.");
        return;
    }

    console.log(`Admin User ID: ${adminUser.id}`);

    // 2. Create Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: adminUser.id,
            role: 'admin'
        });

    if (profileError) console.error('Error creating profile:', profileError);
    else console.log('Profile created/updated.');

    // 3. Store Settings
    const { error: storeError } = await supabase
        .from('store_settings')
        .upsert({
            id: 1,
            is_open: false,
            closing_message: 'We are currently closed.'
        });

    if (storeError) console.error('Error creating store settings:', storeError);
    else console.log('Store settings created/updated.');
}

main();
