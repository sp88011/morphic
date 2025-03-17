import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

//prevent exhaustion of connection pool in dev mode due to hot reload
let connection: postgres.Sql

if (process.env.NODE_ENV === 'production') {
  connection = postgres(process.env.FULL_CONNECTION_STRING!, {
    prepare: false
  })
} else {
  const globalConnection = global as typeof globalThis & {
    connection: postgres.Sql
  }

  if (!globalConnection.connection) {
    globalConnection.connection = postgres(
      process.env.FULL_CONNECTION_STRING!,
      {
        prepare: false
      }
    )
  }
  connection = globalConnection.connection
}

export const db = drizzle(connection, { schema: schema, logger: true })
