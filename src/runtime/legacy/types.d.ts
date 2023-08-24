import type { ParsedContent, QueryBuilder, QueryBuilderParams } from "../types"
import type { H3Event } from 'h3'

export function serverQueryContent<T = ParsedContent>(event: H3Event): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: H3Event, params?: QueryBuilderParams): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: H3Event, query?: string, ...pathParts: string[]): QueryBuilder<T>;