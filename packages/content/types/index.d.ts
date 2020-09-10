import type { contentFunc, extendOrOverwrite, contentFileBeforeInstert, contentFileBeforeParse } from './content'
import type { QueryBuilder } from './query-builder';
import type { IXML } from './parsers/xml';
import type { IMarkdown } from './parsers/markdown';
import type { ICSV } from './parsers/csv';
import type { IYAML } from './parsers/yaml';

import '@nuxt/types';
import type { DumpOptions as YamlOptions } from 'js-yaml';
import type { OptionsV2 as XMLOptions } from 'xml2js';
import type { CSVParseParam as CSVOptions } from 'csvtojson/v2/Parameters';


declare module "vuex/types/index" {
  interface Store<S> {
    $content: QueryBuilder;
  }
}

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
      yaml?: YamlOptions;
      csv?: CSVOptions;
      xml?: XMLOptions;
      extendParser?: {
        [extension: string]: (file: string) => any;
      };
    };
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

declare module '@nuxt/content' {
  export interface parsers {
    xml: IXML;
    markdown: IMarkdown;
    csv: ICSV;
    yaml: IYAML;
  }
}
