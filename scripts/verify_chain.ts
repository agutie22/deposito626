
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to bypass RLS for cleanup if possible, or just anon if policies allow

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Use service key if available for admin tasks, otherwise anon
const supabase = createClient(supabaseUrl, serviceKey || supabaseKey);

async function verify() {
    console.log('🔍 Starting Verification...');

    // 1. Verify Root Number
    console.log('Checking for Root Number (6266271703)...');
    const { data: root, error: rootError } = await supabase
        .from('verified_members')
        .select('*')
        .eq('phone_number', '6266271703')
        .single();

    if (rootError || !root) {
        console.error('❌ Root number NOT found!', rootError);
    } else {
        console.log('✅ Root number found:', root);
    }

    // 2. Verify Trigger (Order -> New Member)
    const testPhone = '5559998888';
    console.log(`Testing Order Trigger with new number: ${testPhone}...`);

    // Clean up first just in case
    await supabase.from('orders').delete().eq('phone', testPhone);
    await supabase.from('verified_members').delete().eq('phone_number', testPhone);

    // Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_name: 'Test Verify',
            phone: testPhone,
            total_amount: 10.00,
            status: 'pending'
        })
        .select()
        .single();

    if (orderError) {
        console.error('❌ Failed to create test order:', orderError);
        return;
    }
    console.log('✅ Test order created.');

    // Wait a moment for trigger
    await new Promise(r => setTimeout(r, 1000));

    // Check verified_members
    const { data: member, error: memberError } = await supabase
        .from('verified_members')
        .select('*')
        .eq('phone_number', testPhone)
        .single();

    if (memberError || !member) {
        console.error('❌ Trigger FAILED. New number was not added to verified_members.', memberError);
    } else {
        console.log('✅ Trigger PASSED. New number was auto-added:', member);
    }
}

verify();
