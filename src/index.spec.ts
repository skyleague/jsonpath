import { JSONPath } from './index.js'

import { boolean, float, forAll, string } from '@skyleague/axioms'
import { describe, expect, expectTypeOf, it } from 'vitest'

describe('simple', () => {
    const simpleObject = {
        foo: 'bar',
        bar: 'foo',
    } as const

    it('properties - foo', () => {
        const value = JSONPath.get(simpleObject, '$.foo')
        expect(value).toMatchInlineSnapshot(`"bar"`)
        expectTypeOf(value).toEqualTypeOf<'bar'>()
    })

    it('properties - bar', () => {
        const value = JSONPath.get(simpleObject, '$.bar')
        expect(value).toMatchInlineSnapshot(`"foo"`)
        expectTypeOf(value).toEqualTypeOf<'foo'>()
    })

    const simpleArray = {
        foos: [{ foo: 'barz' }, { foo: 'bars' }],
    } as const

    it('properties - array', () => {
        const value = JSONPath.get(simpleArray, '$.foos')
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
        expectTypeOf(value).toEqualTypeOf<(typeof simpleArray)['foos']>()
    })

    // it.only('properties - array wildcard', () => {
    //     const value = JSONPath.get(simpleArray, '$.foos[*]')
    //     expect(value).toMatchInlineSnapshot(`
    //         [
    //           {
    //             "foo": "barz",
    //           },
    //           {
    //             "foo": "bars",
    //           },
    //         ]
    //     `)
    //     expectTypeOf(value).toEqualTypeOf<(typeof simpleArray)['foos'][number][]>()
    // })

    it('properties - array wildcard acessor', () => {
        const value = JSONPath.get(simpleArray, '$.foos[*].foo')
        expect(value).toMatchInlineSnapshot(`
            [
              "barz",
              "bars",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<(typeof simpleArray)['foos'][number]['foo'][]>()
    })

    it('properties - partial array wildcard acessor', () => {
        const value = JSONPath.get(simpleArray as Partial<typeof simpleArray>, '$.foos[*].foo')
        expect(value).toMatchInlineSnapshot(`
            [
              "barz",
              "bars",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<(typeof simpleArray)['foos'][number]['foo'][]>()
    })

    it('properties - array number index - exists', () => {
        const value = JSONPath.get(simpleArray, '$.foos[1]')
        expect(value).toMatchInlineSnapshot(`
            {
              "foo": "bars",
            }
        `)
        expectTypeOf(value).toEqualTypeOf<(typeof simpleArray)['foos'][1]>()
    })

    it('properties - array number index - does not exist', () => {
        const value = JSONPath.get(simpleArray, '$.foos[100]')
        expect(value).toMatchInlineSnapshot('undefined')
        expectTypeOf(value).toEqualTypeOf<(typeof simpleArray)['foos'][number] | undefined>()
    })

    it('properties - array number index - does not exist', () => {
        const xs = { xs: [1, 2, 3] }
        const value = JSONPath.get(xs, '$.xs[100]')
        expect(value).toMatchInlineSnapshot('undefined')
        expectTypeOf(value).toEqualTypeOf<number | undefined>()
    })

    it('properties - emtpy array', () => {
        const value = JSONPath.get({ foos: [] as { a: number }[] } as const, '$.foos[*].a')
        expect(value).toMatchInlineSnapshot('[]')
        expectTypeOf(value).toEqualTypeOf<number[]>()
    })

    it('properties - tuple number index - does not exist', () => {
        const xs = { xs: [1, 2, 3] as const }
        const value = JSONPath.get(xs, '$.xs[100]')
        expect(value).toMatchInlineSnapshot('undefined')
        // should ideally be undefined
        expectTypeOf(value).toEqualTypeOf<1 | 2 | 3 | undefined>()
    })

    it('properties - tuple number index - does exist', () => {
        const xs = { xs: [1, 2, 3] as const }
        const value = JSONPath.get(xs, '$.xs[1]')
        expect(value).toMatchInlineSnapshot('2')
        expectTypeOf(value).toEqualTypeOf<2>()
    })

    const simpleNested = {
        far: { foos: [{ foo: 'barz' }, { foo: 'bars' }] },
    } as const

    it('properties - nested', () => {
        const value = JSONPath.get(simpleNested, '$.far.foos')
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
        expectTypeOf(value).toEqualTypeOf<(typeof simpleNested)['far']['foos']>()
    })

    it('properties - nested wildcard', () => {
        const value = JSONPath.get(simpleNested, '$.far.foos[*]')
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
        expectTypeOf(value).toEqualTypeOf<(typeof simpleNested)['far']['foos'][number][]>()
    })

    it('properties - deep partial', () => {
        const dSimpleNested: Partial<typeof simpleNested> = simpleNested
        const value = JSONPath.get(dSimpleNested, '$.far.foos')
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
        expectTypeOf(value).toEqualTypeOf<(typeof simpleNested)['far']['foos'] | undefined>()
    })

    it('properties - deep partial nested access', () => {
        const dSimpleNested: Partial<typeof simpleNested> = simpleNested
        const value = JSONPath.get(dSimpleNested, '$.far.foos[*].foo')
        expect(value).toMatchInlineSnapshot(`
            [
              "barz",
              "bars",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<('bars' | 'barz')[] | undefined>()
    })

    const deepNested = {
        foo: 'bar',
        bar: 'foo',
        foos: [{ foo: 'barz', bar: { foo: 2 } }, { foo: 'bars' }],
    } as const

    it('descent', () => {
        type T = typeof deepNested
        const value = JSONPath.get(deepNested, '$..')
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
        expectTypeOf(value).toEqualTypeOf<(T | T['foos'] | T['foos'][0] | T['foos'][0]['bar'] | T['foos'][1])[]>()
    })

    it('descent - wildcard', () => {
        type T = typeof deepNested
        const value = JSONPath.get(deepNested, '$..*')
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
        expectTypeOf(value).toEqualTypeOf<
            (T['foos'] | T['foos'][0] | T['foos'][0]['bar'] | T['foos'][1] | 'bar' | 'bars' | 'barz' | 'foo' | 2)[]
        >()
    })

    it('script index', () => {
        type T = typeof deepNested
        const value = JSONPath.get(deepNested, '$.foos[(@.length-1)]', { eval: true })
        expect(value).toMatchInlineSnapshot(`
            {
              "foo": "bars",
            }
        `)
        expectTypeOf(value).toEqualTypeOf<T['foos'][number] | undefined>()
    })

    const nested = {
        foo: { bar: 'foo' },
        foos: { bar: 'foo', foo: 'bar' },
    } as const

    it('select property', () => {
        const value = JSONPath.get(nested, '$.foo[bar]')
        expect(value).toMatchInlineSnapshot(`"foo"`)
        expectTypeOf(value).toEqualTypeOf<'foo'>()
    })

    it('select properties', () => {
        const value = JSONPath.get(nested, '$.foos[bar,foo]')
        expect(value).toMatchInlineSnapshot(`
            [
              "foo",
              "bar",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<('bar' | 'foo')[]>()
    })

    it('select property descent', () => {
        const value = JSONPath.get(nested, '$..[bar]')
        expect(value).toMatchInlineSnapshot(`
            [
              "foo",
              "foo",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<'foo'[]>()
    })

    it('select properties descent', () => {
        const value = JSONPath.get(nested, '$..[bar,foo]')
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
        expectTypeOf(value).toEqualTypeOf<('bar' | 'foo' | { readonly bar: 'foo' })[]>()
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
        expect(value).toMatchInlineSnapshot(`
            {
              "color": "red",
              "price": 19.95,
            }
        `)
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['bicycle']>()
    })

    it('books', () => {
        const value = JSONPath.get(object, '$.store.book[*]')
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
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number][]>()
    })

    it('authors', () => {
        const value = JSONPath.get(object, '$.store.book[*].author')
        expect(value).toMatchInlineSnapshot(`
            [
              "Nigel Rees",
              "Evelyn Waugh",
              "Herman Melville",
              "J. R. R. Tolkien",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<('Evelyn Waugh' | 'Herman Melville' | 'J. R. R. Tolkien' | 'Nigel Rees')[]>()
    })

    it('all authors', () => {
        const value = JSONPath.get(object, '$..author')
        expect(value).toMatchInlineSnapshot(`
            [
              "Nigel Rees",
              "Evelyn Waugh",
              "Herman Melville",
              "J. R. R. Tolkien",
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<('Evelyn Waugh' | 'Herman Melville' | 'J. R. R. Tolkien' | 'Nigel Rees')[]>()
    })

    it('all things in store', () => {
        const value = JSONPath.get(object, '$.store.*')
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
        expectTypeOf(value).toEqualTypeOf<((typeof object)['store']['bicycle'] | (typeof object)['store']['book'])[]>()
    })

    it('price of everything', () => {
        const value = JSONPath.get(object, '$.store..price')
        expect(value).toMatchInlineSnapshot(`
            [
              19.95,
              8.95,
              12.99,
              8.99,
              22.99,
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<(8.95 | 8.99 | 12.99 | 19.95 | 22.99)[]>()
    })

    it('third book', () => {
        const value = JSONPath.get(object, '$..book[2]')
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
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][2][]>()
    })

    it('third book - full index', () => {
        const value = JSONPath.get(object, '$.store.book[2]')
        expect(value).toMatchInlineSnapshot(`
            {
              "author": "Herman Melville",
              "category": "fiction",
              "isbn": "0-553-21311-3",
              "price": 8.99,
              "title": "Moby Dick",
            }
        `)
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][2]>()
    })

    it('first two books', () => {
        const value = JSONPath.get(object, '$..book[0,1]')
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
        expectTypeOf(value).toEqualTypeOf<((typeof object)['store']['book'][0] | (typeof object)['store']['book'][1])[]>()
    })

    it('first two books - full index', () => {
        const value = JSONPath.get(object, '$.store.book[0,1]')
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
        expectTypeOf(value).toEqualTypeOf<((typeof object)['store']['book'][0] | (typeof object)['store']['book'][1])[]>()
    })

    it('book - script index', () => {
        const value = JSONPath.get(object, '$..book[(@.length-1)]', { eval: true })
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
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number][] | undefined>()
    })

    it('book - script full index', () => {
        const value = JSONPath.get(object, '$.store.book[(@.length-1)]', { eval: true })
        expect(value).toMatchInlineSnapshot(`
            {
              "author": "J. R. R. Tolkien",
              "category": "fiction",
              "isbn": "0-395-19395-8",
              "price": 22.99,
              "title": "The Lord of the Rings",
            }
        `)
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number] | undefined>()
    })

    it('book - slice', () => {
        const value = JSONPath.get(object, '$.store.book[:2]')
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
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number]>()
    })

    it('categories and authors of all books', () => {
        const value = JSONPath.get(object, '$..book[0][category,author,price]')
        expect(value).toMatchInlineSnapshot(`
            [
              "reference",
              "Nigel Rees",
              8.95,
            ]
        `)
        expectTypeOf(value).toEqualTypeOf<('Nigel Rees' | 'reference' | 8.95)[]>()
    })

    it('books with isbn', () => {
        const value = JSONPath.get(object, '$..book[?(@.isbn)]', { eval: true })
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
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number][] | undefined>()
    })

    it('books with price < 10', () => {
        const value = JSONPath.get(object, '$..book[?(@.price<10)]', { eval: true })
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
        expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number][] | undefined>()
    })

    it.skip('books filter', () => {
        const value = JSONPath.get(object, `$..*[?(@property === 'price' && @ !== 8.95)]`, { eval: true })
        expect(value).toMatchInlineSnapshot(`
        [
          19.95,
          12.99,
          8.99,
          22.99,
        ]
        `)
        // not supported
        // expectTypeOf(value).toEqualTypeOf<(typeof object)['store']['book'][number][] | undefined>()
    })

    it('root', () => {
        const value = JSONPath.get(object, '$')
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
        expectTypeOf(value).toEqualTypeOf<typeof object>()
    })

    it('property names', () => {
        const value = JSONPath.get(object, '$.*~')
        expect(value).toMatchInlineSnapshot(`"store"`)
        // expectTypeOf(value).toEqualTypeOf<(typeof object)[keyof typeof object]>()
    })

    it('root on primitive - number', () => {
        forAll(float(), (x) => {
            const value = JSONPath.get(x, '$')
            expect(value).toEqual(x)
            expectTypeOf(value).toEqualTypeOf<number>()

            const valueArray = JSONPath.get([x], '$')
            expect(valueArray).toEqual([x])
            expectTypeOf(valueArray).toEqualTypeOf<number[]>()
        })
    })

    it('root on primitive - string', () => {
        forAll(string(), (x) => {
            const value = JSONPath.get(x, '$')
            expect(value).toEqual(x)
            expectTypeOf(value).toEqualTypeOf<string>()

            const valueArray = JSONPath.get([x], '$')
            expect(valueArray).toEqual([x])
            expectTypeOf(valueArray).toEqualTypeOf<string[]>()
        })
    })

    it('root on primitive - boolean', () => {
        forAll(boolean(), (x) => {
            const value = JSONPath.get(x, '$')
            expect(value).toEqual(x)
            expectTypeOf(value).toEqualTypeOf<boolean>()

            const valueArray = JSONPath.get([x], '$')
            expect(valueArray).toEqual([x])
            expectTypeOf(valueArray).toEqualTypeOf<boolean[]>()
        })
    })
})

describe('other', () => {
    it('record', () => {
        const objects: Record<string, { price: number; other?: { price: number } }> = {
            a: { price: 1 },
            b: { price: 2, other: { price: 3 } },
        }
        const value = JSONPath.get(objects, '$.*.price')
        expect(value).toMatchInlineSnapshot(`
          [
            1,
            2,
          ]
        `)
        expectTypeOf(value).toEqualTypeOf<number[]>()
    })
})
