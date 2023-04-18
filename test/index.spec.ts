import { JSONPath } from '../index.js'

import { expect, it } from 'vitest'

it('import', () => {
    expect(JSONPath.get({ foo: 'bar' }, '$.foo')).toEqual('bar')
})
