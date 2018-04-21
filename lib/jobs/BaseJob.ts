import Server from '../server';

export default abstract class BaseJob {
  constructor(public name: String, public options: any = {}) {
  }

  public abstract async run(server: Server): Promise<void>;
}
