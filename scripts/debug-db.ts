
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
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
    console.log('Checking Order of Operations...');

    // Check auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) console.error('Error listing users:', userError);
    else {
        console.log(`Found ${users.users.length} users.`);
        users.users.forEach(u => console.log(`- ${u.email} (${u.id})`));
    }

    // Check profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

    if (profileError) console.error('Error listing profiles:', profileError);
    else {
        console.log(`Found ${profiles.length} profiles.`);
        profiles.forEach(p => console.log(`- ${p.id}: ${p.role}`));
    }

    // Check products
    const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (productError) console.error('Error counting products:', productError);
    else console.log(`Found ${productCount} products.`);

}

main();
