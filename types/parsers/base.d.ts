export abstract class baseParser<Options> {
    constructor(options?: Options);
    options: Options;
    abstract toJSON(file: string): any;
}
