import * as schema from '../drizzle/schema'

//Drizzle Helper Type for relational queries
import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations
} from 'drizzle-orm'

type TSchema = ExtractTablesWithRelations<typeof schema>
type QueryConfig<TableName extends keyof TSchema> = DBQueryConfig<
  'one' | 'many',
  boolean,
  TSchema,
  TSchema[TableName]
>

export type InferQueryModel<
  TableName extends keyof TSchema,
  QBConfig extends QueryConfig<TableName> = object
> = BuildQueryResult<TSchema, TSchema[TableName], QBConfig>
