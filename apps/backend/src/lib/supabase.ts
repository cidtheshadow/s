import { createClient } from '@supabase/supabase-js';
import { Bindings } from '../types.js';

export function getEnvVar(env: Bindings | undefined, key: keyof Bindings): string | undefined {
  if (env && env[key]) return env[key];
  const gProcess = (globalThis as any).process;
  if (gProcess && gProcess.env && gProcess.env[key]) return gProcess.env[key];
  return undefined;
}

export function getSupabaseServiceClient(env: Bindings) {
  const url = getEnvVar(env, 'SUPABASE_URL') || 'https://placeholder.supabase.co';
  const key = getEnvVar(env, 'SUPABASE_SERVICE_ROLE_KEY') || 'placeholder-service-key';
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getSupabaseAnonClient(env: Bindings) {
  const url = getEnvVar(env, 'SUPABASE_URL') || 'https://placeholder.supabase.co';
  const key = getEnvVar(env, 'SUPABASE_ANON_KEY') || 'placeholder-anon-key';
  return createClient(url, key);
}
