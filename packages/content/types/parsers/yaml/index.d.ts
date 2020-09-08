import type { State as YamlOptions } from 'js-yaml';
export class IYAML {
  constructor(options?: YamlOptions);
  options: YamlOptions;
  /**
   * Converts yaml document to it's JSON structure.
   * @param {string} file - Yaml file
   * @return {Object}
   */
  toJSON(file: string): any;
}
