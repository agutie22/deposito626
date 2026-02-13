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

async function restock() {
    console.log('📦 Restocking Products...');
    // Update all products to have 100 stock
    // This should fire the trigger and set status to 'in_stock'
    const { error } = await supabase
        .from('products')
        .update({ stock_quantity: 100 })
        .neq('id', 0); // Update all

    if (error) {
        console.error('❌ Error restocking:', error);
    } else {
        console.log('✅ Products restocked to 100.');
    }
}

restock();
