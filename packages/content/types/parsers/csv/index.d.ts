import type { baseParser } from '../base';
import type { CSVParseParam as CSVOptions } from 'csvtojson/v2/Parameters';

export class ICSV extends baseParser<CSVOptions> {
  /**
   * Converts csv document to it's JSON structure.
   * @param file - Csv file
   * @return JSON
   */
  toJSON(file: string): any;
}
