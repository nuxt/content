import type { CSVParseParam as CSVOptions } from 'csvtojson/v2/Parameters';
export class ICSV {
  constructor(options?: CSVOptions);
  options: CSVOptions;
  /**
   * Converts csv document to it's JSON structure.
   * @param file - Csv file
   * @return JSON
   */
  toJSON(file: string): any;
}
