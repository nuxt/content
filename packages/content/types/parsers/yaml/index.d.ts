export interface IYAML {
  constructor(options?: {});
  options: {};
  /**
   * Converts yaml document to it's JSON structure.
   * @param {string} file - Yaml file
   * @return {Object}
   */
  toJSON(file: string): any;
}
