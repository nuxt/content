import '@nuxt/types';
import './vuex';

import { DumpOptions as yamlOptions } from 'js-yaml';
import { OptionsV2 as xmlOptions } from 'xml2js';
import { CSVParseParam as csvOptions } from 'csvtojson/v2/Parameters';
import type { Database from './lib/database';
import type QueryBuilder from './lib/query-builder'

type contentFunc = (...args: Array<string | Object>) => QueryBuilder;

type Result = Object[] & {
  0: 'parallel' | 'sequential';
};

declare module '@nuxt/vue-app' {
  interface Context {
    $content: contentFunc;
  }
}

type extendOrOverwrite<T> = ((old: T) => T) | T;

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $content: contentFunc;
  }

  interface Configuration {
    content?: {
      watch?: boolean;
      liveEdit?: boolean;
      apiPrefix?: string;
      dir?: string;
      fullTextSearchFields?: extendOrOverwrite<Array<string>>;
      nestedProperties?: extendOrOverwrite<Array<string>>;
      markdown?: {
        remarkPlugins?: extendOrOverwrite<Array<string>>;
        rehypePlugins?: extendOrOverwrite<Array<string>>;
        prism?: {
          theme?: string | false;
        };
      };
      yaml?: yamlOptions;
      csv?: csvOptions;
      xml?: xmlOptions;
      extendParser?: {
        [extension: string]: (file: string) => any;
      };
    };
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $content: contentFunc;
  }
}

export interface IContentDocument {
  dir: string;
  path: string;
  extension: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

type contentFileBeforeInstert = (document: IContentDocument, database: Database ) => void;

declare module '@nuxt/types/config/hooks' {
  interface NuxtOptionsHooks {
    'content:file:beforeInsert'?: contentFileBeforeInstert;
    content?: {
      file?: {
        beforeInsert?: contentFileBeforeInstert;
      };
    };
  }
}
