export interface IXML {
  constructor(options?: {});
  options: {};
  /**
   * Converts xml document to it's JSON structure.
   * @param {string} file - xml file
   * @return {Object}
   */
  toJSON(file: string): any;
}
