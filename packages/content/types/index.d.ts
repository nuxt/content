import type { contentFunc, extendOrOverwrite, contentFileBeforeInstert, contentFileBeforeParse } from './content'
import type { QueryBuilder } from './query-builder';

import '@nuxt/types';
import type { DumpOptions as YamlOptions } from 'js-yaml';
import type { OptionsV2 as XMLOptions } from 'xml2js';
import type { CSVParseParam as CSVOptions } from 'csvtojson/v2/Parameters';
import type { Database  as Database_imp } from './database';
import { Highlighter, PromisedHighlighter } from './highlighter';

// Exports of index.js
export const $content: contentFunc
export const Database: Database_imp
export const getOptions: (userOptions: IContentOptions) => IContentOptions

// Modifyed types
declare module "vuex/types/index" {
  interface Store<S> {
    $content: QueryBuilder;
  }
}

interface IContentOptions {
  watch?: boolean;
  liveEdit?: boolean;
  apiPrefix?: string;
  dir?: string;
  fullTextSearchFields?: extendOrOverwrite<Array<string>>;
  nestedProperties?: extendOrOverwrite<Array<string>>;
  markdown?: {
    remarkPlugins?: extendOrOverwrite<Array<string | [string, Record<string, unknown>]>>;
    rehypePlugins?: extendOrOverwrite<Array<string | [string, Record<string, unknown>]>>;
    prism?: {
      theme?: string | false;
    };
    highlighter?: Highlighter | PromisedHighlighter;
  };
  yaml?: YamlOptions;
  csv?: CSVOptions;
  xml?: XMLOptions;
  extendParser?: {
    [extension: string]: (file: string) => any;
  };
}

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $content: contentFunc;
  }

  interface Configuration {
    content?: IContentOptions;
  }
}

declare module '@nuxt/vue-app' {
  interface Context {
    $content: contentFunc;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $content: contentFunc;
  }
}

declare module '@nuxt/types/config/hooks' {
  interface NuxtOptionsHooks {
    'content:file:beforeInsert'?: contentFileBeforeInstert;
    'content:file:beforeParse'?: contentFileBeforeParse;
    content?: {
      file?: {
        beforeInsert?: contentFileBeforeInstert;
        beforeParse?: contentFileBeforeParse;
      };
    };
  }
}
