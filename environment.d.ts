declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      SERVER_URL: string;
      AIRTABLE_CLIENT_ID: string;
      AIRTABLE_REDIRECT_URI: string;
      AIRTABLE_CODE_VERIFIER: string;
      AUTH_SECRET: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_BUCKET_NAME: string;
      POSTGRES_URL: string;
      RESEND_API_KEY: string;
      RESEND_FROM_SEND: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
    }
  }
}

export {};
