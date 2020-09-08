import type { State as YamlOptions } from 'js-yaml';
export class IYAML {
  constructor(options?: YamlOptions);
  options: YamlOptions;
  /**
   * Converts yaml document to it's JSON structure.
   * @param file - Yaml file
   * @return JSON
   */
  toJSON(file: string): any;
}
