import { loadEnvConfig } from '@next/env'
import type { Config } from 'drizzle-kit'
import { cwd } from 'node:process'
loadEnvConfig(cwd())

export default {
  dialect: 'postgresql',
  schema: ['lib/drizzle/schema.ts'],
  schemaFilter: ['public'], // Only push tables in the public schema, see https://github.com/supabase/supabase/issues/19883
  out: 'supabase/migrations',

  dbCredentials: {
    url: process.env.FULL_CONNECTION_STRING!
  }
} satisfies Config
