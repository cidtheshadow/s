import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.env.SUPABASE_URL || 'https://lztmqzhhxdkzrkqrlaty.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dG1xemhoeGRrenJrcXJsYXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0NDY0NywiZXhwIjoyMTA1MDIwNjQ3fQ.owbrFQrKgL91FbleKky79dxEw0v_iYOGmRVVsIz8iI8';

console.log('Connecting to Supabase:', url);
const supabase = createClient(url, serviceKey);

async function run() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log('Migration files to execute:', files);
  
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`Executing ${file}...`);
    // Note: Supabase migrations are best executed via Supabase SQL Editor or CLI/Postgres connection string.
  }
}

run().catch(console.error);
