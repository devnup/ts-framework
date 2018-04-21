import * as Raven from 'raven';

export interface SentryTransportOptions extends Raven.ConstructorOptions {
  dsn: string;
  level?: string;
  levelsMap?: any;
  install?: boolean;
  raven?: Raven.Client;
}
