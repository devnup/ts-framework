import BaseError, { BaseErrorDetails } from '../../lib/error/BaseError';

describe('BaseError', () => {
  it('should instantiate a simple error details', () => {
    expect(new BaseErrorDetails()).toBeDefined();
    const details = new BaseErrorDetails({ test: 'ok' });
    expect(details).toHaveProperty('test', 'ok');
  });

  it('should instantiate a simple error', () => {
    const error = new BaseError('Test error');

    // Basic error attributes
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('stackId');
    expect(error).toHaveProperty('stack');
    expect(error.message).toMatch(new RegExp(error.stackId));

    // Basic methods
    const obj = error.toObject();
    const json = error.toJSON();
    const strJson = error.toJSON(true);
    expect(obj).toHaveProperty('stack');
    expect(obj).toHaveProperty('message', error.message);
    expect(obj).toHaveProperty('stackId', error.stackId);
    expect(json).toEqual(JSON.parse(strJson as string));
  });

  it('should instantiate a simple error based on details object', () => {
    const error = new BaseError('Test error', { test: 'ok' });

    // Basic error attributes
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('stackId');
    expect(error).toHaveProperty('stack');
    expect(error.message).toMatch(new RegExp(error.stackId));
    expect(error).toHaveProperty('details');
    expect(error.details).toHaveProperty('test', 'ok');

    // Basic methods
    const obj = error.toObject();
    const json = error.toJSON();
    const strJson = error.toJSON(true);
    expect(obj).toHaveProperty('stack');
    expect(obj).toHaveProperty('message', error.message);
    expect(obj).toHaveProperty('stackId', error.stackId);
    expect(json).toEqual(JSON.parse(strJson as string));
  });

  it('should instantiate a simple error based on details class object', () => {
    const error = new BaseError('Test error', new BaseErrorDetails({ test: 'ok' }));

    // Basic error attributes
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('stackId');
    expect(error).toHaveProperty('stack');
    expect(error.message).toMatch(new RegExp(error.stackId));
    expect(error).toHaveProperty('details');
    expect(error.details).toHaveProperty('test', 'ok');

    // Basic methods
    const obj = error.toObject();
    const json = error.toJSON();
    const strJson = error.toJSON(true);
    expect(obj).toHaveProperty('stack');
    expect(obj).toHaveProperty('message', error.message);
    expect(obj).toHaveProperty('stackId', error.stackId);
    expect(json).toEqual(JSON.parse(strJson as string));
  });
});
