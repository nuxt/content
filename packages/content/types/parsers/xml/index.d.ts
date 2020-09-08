import type { Options as XMLOptions } from 'xml2js';
export class IXML {
  constructor(options?: XMLOptions);
  options: XMLOptions;
  /**
   * Converts xml document to it's JSON structure.
   * @param file - xml file
   * @return JSON
   */
  toJSON(file: string): any;
}
