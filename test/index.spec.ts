import { JSONPath } from '..'

test('import', () => {
    expect(JSONPath.get({ foo: 'bar' }, '$.foo')).toEqual('bar')
})
