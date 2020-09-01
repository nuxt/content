export interface ICSV {
  constructor(options?: {});
  options: {};
  /**
   * Converts csv document to it's JSON structure.
   * @param {string} file - Csv file
   * @return {Object}
   */
  toJSON(file: string): any;
}
