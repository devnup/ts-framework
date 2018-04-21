import Server from '../server';
export default abstract class BaseJob {
    name: String;
    options: any;
    constructor(name: String, options?: any);
    abstract run(server: Server): Promise<void>;
}
