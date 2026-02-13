import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('🔍 Checking Products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, stock_status, stock_quantity');

    if (error) {
        console.error('❌ Error fetching products:', error);
        return;
    }

    if (!products || products.length === 0) {
        console.log('⚠️ No products found in DB!');
        return;
    }

    console.table(products);
}

checkProducts();
