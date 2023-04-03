import { JSONPath } from '../index.js'

test('import', () => {
    expect(JSONPath.get({ foo: 'bar' }, '$.foo')).toEqual('bar')
})
