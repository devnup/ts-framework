import * as URI from 'urijs';
import { maskAuthUrl } from '../../lib/database/util';

describe('lib.database.Util', () => {

  it('should mask an authentication url', async () => {
    const url = 'mongodb://someuser:somepass@localhost:27017/test';
    const masked = maskAuthUrl(url);

    const uri = new URI(masked);
    expect(uri.protocol()).toBe('mongodb');
    expect(uri.username()).toBe('someuser');
    expect(uri.host()).toBe('localhost:27017');
    expect(uri.password()).not.toMatch(/somepass/);
  });

});
