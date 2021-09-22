import type { baseParser } from '../base';
import type { DumpOptions as YamlOptions } from 'js-yaml';

export class IYAML extends baseParser<YamlOptions>{
  /**
   * Converts yaml document to its JSON structure.
   * @param file - Yaml file
   * @return JSON
   */
  toJSON(file: string): any;
}
