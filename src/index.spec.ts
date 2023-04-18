import { JSONPath } from './index.js'

import type { DeepPartial } from '@skyleague/axioms'
import { expect, describe, it } from 'vitest'

type Assert<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
    ? true
    : { error: 'Types are not equal'; type1: T; type2: U }

describe('simple', () => {
    const simpleObject = {
        foo: 'bar',
        bar: 'foo',
    } as const

    it('properties - foo', () => {
        const value = JSONPath.get(simpleObject, '$.foo')
        const _type: Assert<typeof value, 'bar'> = true
        expect(value).toMatchInlineSnapshot(`"bar"`)
    })

    it('properties - bar', () => {
        const value = JSONPath.get(simpleObject, '$.bar')
        const _type: Assert<typeof value, 'foo'> = true
        expect(value).toMatchInlineSnapshot(`"foo"`)
    })

    const simpleArray = {
        foos: [{ foo: 'barz' }, { foo: 'bars' }],
    } as const

    it('properties - array', () => {
        const value = JSONPath.get(simpleArray, '$.foos')
        const _type: Assert<typeof value, (typeof simpleArray)['foos']> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "foo": "barz",
              },
              {
                "foo": "bars",
              },
            ]
        `)
    })

    it('properties - array wildcard', () => {
        const value = JSONPath.get(simpleArray, '$.foos[*]')
        const _type: Assert<typeof value, (typeof simpleArray)['foos'][number][]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "foo": "barz",
              },
              {
                "foo": "bars",
              },
            ]
        `)
    })

    it('properties - array wildcard acessor', () => {
        const value = JSONPath.get(simpleArray, '$.foos[*].foo')
        const _type: Assert<typeof value, (typeof simpleArray)['foos'][number]['foo'][]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "barz",
              "bars",
            ]
        `)
    })

    it('properties - partial array wildcard acessor', () => {
        const value = JSONPath.get(simpleArray as DeepPartial<typeof simpleArray>, '$.foos[*].foo')
        const _type: Assert<typeof value, (typeof simpleArray)['foos'][number]['foo'][]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "barz",
              "bars",
            ]
        `)
    })

    it('properties - array number index - exists', () => {
        const value = JSONPath.get(simpleArray, '$.foos[1]')
        const _type: Assert<typeof value, (typeof simpleArray)['foos'][1]> = true
        expect(value).toMatchInlineSnapshot(`
            {
              "foo": "bars",
            }
        `)
    })

    it('properties - array number index - does not exist', () => {
        const value = JSONPath.get(simpleArray, '$.foos[100]')
        const _type: Assert<typeof value, (typeof simpleArray)['foos'][number] | undefined> = true
        expect(value).toMatchInlineSnapshot(`undefined`)
    })

    it('properties - array number index - does not exist', () => {
        const xs = { xs: [1, 2, 3] }
        const value = JSONPath.get(xs, '$.xs[100]')
        const _type: Assert<typeof value, number | undefined> = true
        expect(value).toMatchInlineSnapshot(`undefined`)
    })

    const simpleNested = {
        far: { foos: [{ foo: 'barz' }, { foo: 'bars' }] },
    } as const

    it('properties - nested', () => {
        const value = JSONPath.get(simpleNested, '$.far.foos')
        const _type: Assert<typeof value, (typeof simpleNested)['far']['foos']> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "foo": "barz",
              },
              {
                "foo": "bars",
              },
            ]
        `)
    })

    it('properties - nested wildcard', () => {
        const value = JSONPath.get(simpleNested, '$.far.foos[*]')
        const _type: Assert<typeof value, (typeof simpleNested)['far']['foos'][number][]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "foo": "barz",
              },
              {
                "foo": "bars",
              },
            ]
        `)
    })

    it('properties - deep partial', () => {
        const dSimpleNested: DeepPartial<typeof simpleNested> = simpleNested
        const value = JSONPath.get(dSimpleNested, '$.far.foos')
        const _type: Assert<typeof value, (typeof simpleNested)['far']['foos'] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "foo": "barz",
              },
              {
                "foo": "bars",
              },
            ]
        `)
    })

    it('properties - deep partial nested access', () => {
        const dSimpleNested: DeepPartial<typeof simpleNested> = simpleNested
        const value = JSONPath.get(dSimpleNested, '$.far.foos[*].foo')
        const _type: Assert<typeof value, ('bars' | 'barz')[] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "barz",
              "bars",
            ]
        `)
    })

    const deepNested = {
        foo: 'bar',
        bar: 'foo',
        foos: [{ foo: 'barz', bar: { foo: 2 } }, { foo: 'bars' }],
    } as const

    it('descent', () => {
        type T = typeof deepNested
        const value = JSONPath.get(deepNested, '$..')
        const _type: Assert<typeof value, (T | T['foos'] | T['foos'][0] | T['foos'][0]['bar'] | T['foos'][1])[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "bar": "foo",
                "foo": "bar",
                "foos": [
                  {
                    "bar": {
                      "foo": 2,
                    },
                    "foo": "barz",
                  },
                  {
                    "foo": "bars",
                  },
                ],
              },
              [
                {
                  "bar": {
                    "foo": 2,
                  },
                  "foo": "barz",
                },
                {
                  "foo": "bars",
                },
              ],
              {
                "bar": {
                  "foo": 2,
                },
                "foo": "barz",
              },
              {
                "foo": 2,
              },
              {
                "foo": "bars",
              },
            ]
        `)
    })

    it('descent - wildcard', () => {
        type T = typeof deepNested
        const value = JSONPath.get(deepNested, '$..*')
        const _type: Assert<
            typeof value,
            (T['foos'] | T['foos'][0] | T['foos'][0]['bar'] | T['foos'][1] | 'bar' | 'bars' | 'barz' | 'foo' | 2)[]
        > = true
        expect(value).toMatchInlineSnapshot(`
            [
              "bar",
              "foo",
              [
                {
                  "bar": {
                    "foo": 2,
                  },
                  "foo": "barz",
                },
                {
                  "foo": "bars",
                },
              ],
              {
                "bar": {
                  "foo": 2,
                },
                "foo": "barz",
              },
              {
                "foo": "bars",
              },
              "barz",
              {
                "foo": 2,
              },
              2,
              "bars",
            ]
        `)
    })

    it('script index', () => {
        type T = typeof deepNested
        const value = JSONPath.get(deepNested, '$.foos[(@.length-1)]')
        const _type: Assert<typeof value, T['foos'][number] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            {
              "foo": "bars",
            }
        `)
    })

    const nested = {
        foo: { bar: 'foo' },
        foos: { bar: 'foo', foo: 'bar' },
    } as const

    it('select property', () => {
        const value = JSONPath.get(nested, '$.foo[bar]')
        const _type: Assert<typeof value, 'foo'> = true
        expect(value).toMatchInlineSnapshot(`"foo"`)
    })

    it('select properties', () => {
        const value = JSONPath.get(nested, '$.foos[bar,foo]')
        const _type: Assert<typeof value, ('bar' | 'foo')[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "foo",
              "bar",
            ]
        `)
    })

    it('select property descent', () => {
        const value = JSONPath.get(nested, '$..[bar]')
        const _type: Assert<typeof value, 'foo'[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "foo",
              "foo",
            ]
        `)
    })

    it('select properties descent', () => {
        const value = JSONPath.get(nested, '$..[bar,foo]')
        const _type: Assert<typeof value, ('bar' | 'foo' | { readonly bar: 'foo' })[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "bar": "foo",
              },
              "foo",
              "foo",
              "bar",
            ]
        `)
    })
})

describe('store', () => {
    const object = {
        store: {
            bicycle: {
                color: 'red',
                price: 19.95,
            },
            book: [
                {
                    category: 'reference',
                    author: 'Nigel Rees',
                    title: 'Sayings of the Century',
                    price: 8.95,
                },
                {
                    category: 'fiction',
                    author: 'Evelyn Waugh',
                    title: 'Sword of Honour',
                    price: 12.99,
                },
                {
                    category: 'fiction',
                    author: 'Herman Melville',
                    title: 'Moby Dick',
                    isbn: '0-553-21311-3',
                    price: 8.99,
                },
                {
                    category: 'fiction',
                    author: 'J. R. R. Tolkien',
                    title: 'The Lord of the Rings',
                    isbn: '0-395-19395-8',
                    price: 22.99,
                },
            ],
        },
    } as const

    it('bicycle', () => {
        const value = JSONPath.get(object, '$.store.bicycle')
        const _type: Assert<typeof value, (typeof object)['store']['bicycle']> = true
        expect(value).toMatchInlineSnapshot(`
            {
              "color": "red",
              "price": 19.95,
            }
        `)
    })

    it('books', () => {
        const value = JSONPath.get(object, '$.store.book[*]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][number][]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Nigel Rees",
                "category": "reference",
                "price": 8.95,
                "title": "Sayings of the Century",
              },
              {
                "author": "Evelyn Waugh",
                "category": "fiction",
                "price": 12.99,
                "title": "Sword of Honour",
              },
              {
                "author": "Herman Melville",
                "category": "fiction",
                "isbn": "0-553-21311-3",
                "price": 8.99,
                "title": "Moby Dick",
              },
              {
                "author": "J. R. R. Tolkien",
                "category": "fiction",
                "isbn": "0-395-19395-8",
                "price": 22.99,
                "title": "The Lord of the Rings",
              },
            ]
        `)
    })

    it('authors', () => {
        const value = JSONPath.get(object, '$.store.book[*].author')
        const _type: Assert<typeof value, ('Evelyn Waugh' | 'Herman Melville' | 'J. R. R. Tolkien' | 'Nigel Rees')[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "Nigel Rees",
              "Evelyn Waugh",
              "Herman Melville",
              "J. R. R. Tolkien",
            ]
        `)
    })

    it('all authors', () => {
        const value = JSONPath.get(object, '$..author')
        const _type: Assert<typeof value, ('Evelyn Waugh' | 'Herman Melville' | 'J. R. R. Tolkien' | 'Nigel Rees')[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "Nigel Rees",
              "Evelyn Waugh",
              "Herman Melville",
              "J. R. R. Tolkien",
            ]
        `)
    })

    it('all things in store', () => {
        const value = JSONPath.get(object, '$.store.*')
        const _type: Assert<typeof value, ((typeof object)['store']['bicycle'] | (typeof object)['store']['book'])[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "color": "red",
                "price": 19.95,
              },
              [
                {
                  "author": "Nigel Rees",
                  "category": "reference",
                  "price": 8.95,
                  "title": "Sayings of the Century",
                },
                {
                  "author": "Evelyn Waugh",
                  "category": "fiction",
                  "price": 12.99,
                  "title": "Sword of Honour",
                },
                {
                  "author": "Herman Melville",
                  "category": "fiction",
                  "isbn": "0-553-21311-3",
                  "price": 8.99,
                  "title": "Moby Dick",
                },
                {
                  "author": "J. R. R. Tolkien",
                  "category": "fiction",
                  "isbn": "0-395-19395-8",
                  "price": 22.99,
                  "title": "The Lord of the Rings",
                },
              ],
            ]
        `)
    })

    it('price of everything', () => {
        const value = JSONPath.get(object, '$.store..price')
        const _type: Assert<typeof value, (8.95 | 8.99 | 12.99 | 19.95 | 22.99)[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              19.95,
              8.95,
              12.99,
              8.99,
              22.99,
            ]
        `)
    })

    it('third book', () => {
        const value = JSONPath.get(object, '$..book[2]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][2][]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Herman Melville",
                "category": "fiction",
                "isbn": "0-553-21311-3",
                "price": 8.99,
                "title": "Moby Dick",
              },
            ]
        `)
    })

    it('third book - full index', () => {
        const value = JSONPath.get(object, '$.store.book[2]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][2]> = true
        expect(value).toMatchInlineSnapshot(`
            {
              "author": "Herman Melville",
              "category": "fiction",
              "isbn": "0-553-21311-3",
              "price": 8.99,
              "title": "Moby Dick",
            }
        `)
    })

    it('first two books', () => {
        const value = JSONPath.get(object, '$..book[0,1]')
        const _type: Assert<typeof value, ((typeof object)['store']['book'][0] | (typeof object)['store']['book'][1])[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Nigel Rees",
                "category": "reference",
                "price": 8.95,
                "title": "Sayings of the Century",
              },
              {
                "author": "Evelyn Waugh",
                "category": "fiction",
                "price": 12.99,
                "title": "Sword of Honour",
              },
            ]
        `)
    })

    it('first two books - full index', () => {
        const value = JSONPath.get(object, '$.store.book[0,1]')
        const _type: Assert<typeof value, ((typeof object)['store']['book'][0] | (typeof object)['store']['book'][1])[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Nigel Rees",
                "category": "reference",
                "price": 8.95,
                "title": "Sayings of the Century",
              },
              {
                "author": "Evelyn Waugh",
                "category": "fiction",
                "price": 12.99,
                "title": "Sword of Honour",
              },
            ]
        `)
    })

    it('book - script index', () => {
        const value = JSONPath.get(object, '$..book[(@.length-1)]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][number][] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "J. R. R. Tolkien",
                "category": "fiction",
                "isbn": "0-395-19395-8",
                "price": 22.99,
                "title": "The Lord of the Rings",
              },
            ]
        `)
    })

    it('book - script full index', () => {
        const value = JSONPath.get(object, '$.store.book[(@.length-1)]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][number] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            {
              "author": "J. R. R. Tolkien",
              "category": "fiction",
              "isbn": "0-395-19395-8",
              "price": 22.99,
              "title": "The Lord of the Rings",
            }
        `)
    })

    it('book - slice', () => {
        const value = JSONPath.get(object, '$.store.book[:2]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][number]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Nigel Rees",
                "category": "reference",
                "price": 8.95,
                "title": "Sayings of the Century",
              },
              {
                "author": "Evelyn Waugh",
                "category": "fiction",
                "price": 12.99,
                "title": "Sword of Honour",
              },
            ]
        `)
    })

    it('categories and authors of all books', () => {
        const value = JSONPath.get(object, '$..book[0][category,author,price]')
        const _type: Assert<typeof value, ('Nigel Rees' | 'reference' | 8.95)[]> = true
        expect(value).toMatchInlineSnapshot(`
            [
              "reference",
              "Nigel Rees",
              8.95,
            ]
        `)
    })

    it('books with isbn', () => {
        const value = JSONPath.get(object, '$..book[?(@.isbn)]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][number][] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Herman Melville",
                "category": "fiction",
                "isbn": "0-553-21311-3",
                "price": 8.99,
                "title": "Moby Dick",
              },
              {
                "author": "J. R. R. Tolkien",
                "category": "fiction",
                "isbn": "0-395-19395-8",
                "price": 22.99,
                "title": "The Lord of the Rings",
              },
            ]
        `)
    })

    it('books with price < 10', () => {
        const value = JSONPath.get(object, '$..book[?(@.price<10)]')
        const _type: Assert<typeof value, (typeof object)['store']['book'][number][] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            [
              {
                "author": "Nigel Rees",
                "category": "reference",
                "price": 8.95,
                "title": "Sayings of the Century",
              },
              {
                "author": "Herman Melville",
                "category": "fiction",
                "isbn": "0-553-21311-3",
                "price": 8.99,
                "title": "Moby Dick",
              },
            ]
        `)
    })

    it.skip('books filter', () => {
        const value = JSONPath.get(object, `$..*[?(@property === 'price' && @ !== 8.95)]`)
        // not supported
        // const _type: Assert<typeof value, typeof object['store']['book'][number][] | undefined> = true
        expect(value).toMatchInlineSnapshot(`
            [
              19.95,
              12.99,
              8.99,
              22.99,
            ]
        `)
    })

    it('root', () => {
        const value = JSONPath.get(object, `$`)
        const _type: Assert<typeof value, typeof object> = true
        expect(value).toMatchInlineSnapshot(`
            {
              "store": {
                "bicycle": {
                  "color": "red",
                  "price": 19.95,
                },
                "book": [
                  {
                    "author": "Nigel Rees",
                    "category": "reference",
                    "price": 8.95,
                    "title": "Sayings of the Century",
                  },
                  {
                    "author": "Evelyn Waugh",
                    "category": "fiction",
                    "price": 12.99,
                    "title": "Sword of Honour",
                  },
                  {
                    "author": "Herman Melville",
                    "category": "fiction",
                    "isbn": "0-553-21311-3",
                    "price": 8.99,
                    "title": "Moby Dick",
                  },
                  {
                    "author": "J. R. R. Tolkien",
                    "category": "fiction",
                    "isbn": "0-395-19395-8",
                    "price": 22.99,
                    "title": "The Lord of the Rings",
                  },
                ],
              },
            }
        `)
    })

    it('property names', () => {
        const value = JSONPath.get(object, `$.*~`)
        // const _type: Assert<typeof value, typeof object[keyof typeof object]> = true
        expect(value).toMatchInlineSnapshot(`"store"`)
    })
})
