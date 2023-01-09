# JSONPath [_(@skyleague/jsonpath)_](https://skyleague.github.io/jsonpath/)

<p>
  <img alt="Lines of code" src="https://img.shields.io/tokei/lines/github/skyleague/jsonpath" />
  <img alt="Version" src="https://img.shields.io/github/package-json/v/skyleague/jsonpath" />
  <img alt="LGTM Grade" src="https://img.shields.io/lgtm/grade/javascript/github/skyleague/jsonpath" />
  <img src="https://img.shields.io/badge/node-%3E%3D16-blue.svg" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

JSONPath is a syntax for specifying locations in a JSON document. It allows you to specify a path to a value within the document, using a set of rules and conventions.

## Engine
This library adds a type layer on top of an existing jsonpath engine: [jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus). Having full type inference in JSONPath can be useful because it allows the package to automatically determine the types of the values that are being accessed and manipulated with JSONPath. This can make it easier to use the package, as you don't have to manually specify the types of the values that you are working with.


For example, consider the following JSON object:

```ts
const person = {
  "name": "John Smith",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY"
  }
}
```

With full type inference, you can use JSONPath to access and manipulate the data without needing to manually specify the types of the values. For example, you can use the `JSONPath.get(person, "$.name")` path to access the `name` property, which has a type of string, and you can use the `JSONPath.get(person, "$.age")` path to access the `age` property, which has a type of number.

## Example

```ts
import { JSONPath } from '@skyleague/jsonpath'

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

JSONPath.get(object, '$.store.bicycle') // : (typeof object)['store']['bicycle']
// => {
//    "color": "red",
//    "price": 19.95,
// }
```


## Support

SkyLeague provides Enterprise Support on this open-source library package at clients across industries. Please get in touch via [`https://skyleague.io`](https://skyleague.io).

If you are not under Enterprise Support, feel free to raise an issue and we'll take a look at it on a best-effort basis!

## License & Copyright

This library is licensed under the MIT License (see [LICENSE.md](./LICENSE.md) for details).

If you using this SDK without Enterprise Support, please note this (partial) MIT license clause:

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND

Copyright (c) 2022, SkyLeague Technologies B.V.. 'SkyLeague' and the astronaut logo are trademarks of SkyLeague Technologies, registered at Chamber of Commerce in The Netherlands under number 86650564.

All product names, logos, brands, trademarks and registered trademarks are property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, trademarks and brands does not imply endorsement.
