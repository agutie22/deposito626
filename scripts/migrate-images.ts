import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Ideally use Service Role Key for scripts to bypass RLS, but for now we'll try Anon
// If RLS fails, we might need to sign in as admin or ask user for Service Key.
// However, in local dev, the anon key might not have admin rights unless we sign in.
// To keep it simple, let's assume we can use the Service Role Key if provided, 
// OR we just sign in as the admin user we seeded.

const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(projectRoot, 'public', 'images');

async function migrateImages() {
    console.log('Starting image migration...');

    // Sign in as admin to have upload permissions
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@deposito626.com',
        password: 'password123'
    });

    if (authError) {
        console.error('Failed to sign in as admin:', authError);
        process.exit(1);
    }

    console.log('Signed in as admin.');

    if (!fs.existsSync(imagesDir)) {
        console.log('No public/images directory found. Skipping.');
        return;
    }

    const files = fs.readdirSync(imagesDir);

    for (const file of files) {
        if (file.startsWith('.')) continue; // ignore hidden files

        const filePath = path.join(imagesDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = `migrated_${file}`; // Prefix to avoid collisions or just use name

        console.log(`Uploading ${file}...`);

        const { data, error } = await supabase.storage
            .from('products')
            .upload(fileName, fileBuffer, {
                upsert: true,
                contentType: 'image/png' // Assuming png based on seed, or auto-detect if possible
            });

        if (error) {
            console.error(`Failed to upload ${file}:`, error);
            continue;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        console.log(`Uploaded to ${publicUrl}`);

        // Update Products Table
        // We look for products that referenced this image relatively
        // Old format: '/images/filename.png'
        const oldPath = `/images/${file}`;

        const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: publicUrl })
            .eq('image_url', oldPath);

        if (updateError) {
            console.error(`Failed to update products for ${file}:`, updateError);
        } else {
            console.log(`Updated products referencing ${oldPath}`);
        }
    }

    console.log('Migration complete.');
}

migrateImages().catch(console.error);
