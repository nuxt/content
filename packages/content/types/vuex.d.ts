import { QueryBuilder } from "./query-builder";

declare module "vuex/types/index" {
  interface Store<S> {
    $content: QueryBuilder;
  }
}
