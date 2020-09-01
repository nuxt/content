import '@nuxt/types';
import './vuex';

import { DumpOptions as yamlOptions } from 'js-yaml';
import { OptionsV2 as xmlOptions } from 'xml2js';
import { CSVParseParam as csvOptions } from 'csvtojson/v2/Parameters';

export interface INuxtContentInstance {
  only(keys: string | string[]): INuxtContentInstance;
  without(keys: string | string[]): INuxtContentInstance;
  sortBy(field: string, direction?: string): INuxtContentInstance;
  where(query: Object): INuxtContentInstance;
  search(query: Object | string, value?: string): INuxtContentInstance;
  surround(slug: string, options?: Object): INuxtContentInstance;
  limit(n: number | string): INuxtContentInstance;
  skip(n: number | string): INuxtContentInstance;
  fetch<T = Result | Result[]>(): Promise<T>;
}

type contentFunc = (...args: Array<string | Object>) => INuxtContentInstance;

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

type contentFileBeforeInstert = (document: IContentDocument) => void;

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
