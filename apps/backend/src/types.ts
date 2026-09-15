export interface Bindings {
  ENVIRONMENT: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  GEMINI_API_KEY?: string;
}

export interface Variables {
  user?: {
    id: string;
    phone?: string;
    role?: string;
  };
}

export type AppContext = {
  Bindings: Bindings;
  Variables: Variables;
};
