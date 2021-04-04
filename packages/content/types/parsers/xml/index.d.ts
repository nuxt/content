import type { baseParser } from '../base';
import type { Options as XMLOptions } from 'xml2js';

export class IXML extends baseParser<XMLOptions> {
  /**
   * Converts xml document to its JSON structure.
   * @param file - xml file
   * @return JSON
   */
  toJSON(file: string): any;
}
