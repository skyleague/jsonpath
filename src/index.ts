import type { JSONPathOptions } from 'jsonpath-plus'
import { JSONPath as JSONPathPlus } from 'jsonpath-plus'

export type Root = '$'

type BrandAsOptional<T, Wrapped extends boolean> = Wrapped extends true ? BrandedOptional | T : T | undefined

type PathArrayIndex<T extends ArrayLike<any>, Index extends string, P extends string, Wrapped extends boolean> = Index extends `*`
    ? Wrapped extends true
        ? PathValueAccessor<T[number], P>
        : PathValueAccessor<T[number], P>[]
    : Index extends `${number}`
      ? Index extends keyof T
          ? PathValueAccessor<T[Index], P, Wrapped>
          : BrandAsOptional<PathValueAccessor<T[number], P>, Wrapped>
      : Index extends `(${infer _Script})`
        ? BrandAsOptional<PathValueAccessor<T[number], P>, Wrapped>
        : Index extends `?(${infer _Script})`
          ? BrandAsOptional<PathValueAccessor<T[number], P>, Wrapped>
          : Index extends `:${number}` | `${number}:` | `${number}:${number}:${number}` | `${number}:${number}`
            ? PathValueAccessor<T[number], P, Wrapped>
            : Index extends `${infer First},${infer Rest}`
              ? Wrapped extends true
                  ? PathArrayIndex<T, First, P, Wrapped> | PathArrayIndex<T, Rest, P, Wrapped>
                  : (PathArrayIndex<T, First, P, Wrapped> | PathArrayIndex<T, Rest, P, Wrapped>)[]
              : never

type PathRecordIndex<T, Index extends string, P extends string, Wrapped extends boolean> = T extends Record<PropertyKey, any>
    ? Index extends keyof T
        ? T[Index] // foo[bar] like with direct property name
        : Index extends `${infer First},${infer Rest}` // seperate comma accessors
          ? Wrapped extends true
              ? PathRecordIndex<T, First, P, Wrapped> | PathRecordIndex<T, Rest, P, Wrapped>
              : (PathRecordIndex<T, First, P, Wrapped> | PathRecordIndex<T, Rest, P, Wrapped>)[]
          : never
    : never

type PathValueIndex<T, Index extends string, P extends string, Wrapped extends boolean> = T extends ArrayLike<any>
    ? PathArrayIndex<T, Index, P, Wrapped>
    : PathRecordIndex<T, Index, P, Wrapped>

type PathValueChildIndex<T, K extends string, Index extends string, P extends string, Wrapped extends boolean> = K extends ''
    ? never
    : K extends keyof T
      ? PathValueIndex<T[K], Index, P, Wrapped>
      : never

type PathRecursiveDescent<T, P extends string> = T extends readonly any[]
    ? PathRecursiveDescent<T[number], P> | PathValueAccessor<T, P, true>
    : T extends Record<PropertyKey, any>
      ? PathRecursiveDescent<T[keyof T], P> | PathValueAccessor<T, P, true>
      : never

type PathWildCard<T> = T extends readonly any[] ? T[number] : T extends Record<PropertyKey, any> ? T[keyof T] : T

type PathValueChild<T, K extends string, P extends string, Wrapped extends boolean> = K extends `[${infer Index}]`
    ? PathValueIndex<T, Index, P, Wrapped>
    : K extends `${infer A}[${infer Index}]`
      ? PathValueChildIndex<T, A, Index, P, Wrapped>
      : K extends keyof T
        ? undefined extends T[K]
            ? PathValueAccessor<Exclude<T[K], undefined>, P, Wrapped> | undefined
            : PathValueAccessor<T[K], P, Wrapped>
        : K extends `*${infer Rest}`
          ? Wrapped extends true
              ? PathValueAccessor<PathWildCard<T>, `${Rest}${P}`, Wrapped>
              : PathValueAccessor<PathWildCard<T>, `${Rest}${P}`, Wrapped>[]
          : never

const BrandedOptional = Symbol.for('(optional)')
type BrandedOptional = typeof BrandedOptional
type AsMaybeArray<T> = BrandedOptional extends T ? Exclude<T, BrandedOptional>[] | undefined : T[]

type PathValueAccessor<T, P extends string, Wrapped extends boolean = false> = P extends '' // empty Rest parameter
    ? T // stop iterating
    : P extends `.${infer Rest}` // recursive descent
      ? AsMaybeArray<PathRecursiveDescent<T, Rest>>
      : // : P extends `~${infer Rest}` // property names
        // ? PathValue<Parent[keyof Parent], Rest, Parent>
        P extends `${infer _A}[${infer _Index}]${infer Rest}` // is indexed (prevents detecting . in index)
        ? _A extends `${infer _First}.${infer _Second}` // make indexing non greedy (e.g. foo.bar[] should match foo.bar first)
            ? PathValueChild<T, _First, `${_Second}[${_Index}]${Rest}`, Wrapped>
            : Rest extends `.${infer _Rest}` // matches foo[].bar where _Rest is bar
              ? PathValueChild<T, `${_A}[${_Index}]`, _Rest, Wrapped>
              : PathValueChild<T, `${_A}[${_Index}]`, Rest, Wrapped> // TODO: subscript
        : P extends `${infer K}.${infer Rest}` // dot accessor
          ? PathValueChild<T, K, Rest, Wrapped>
          : PathValueChild<T, P, '', Wrapped>

export type JSONPathValue<T, P extends string> = P extends `${infer Start}.${infer Rest}`
    ? Start extends Root
        ? PathValueAccessor<T, Rest>
        : never
    : P extends Root
      ? T
      : never

export const JSONPath = {
    get: function <T, P extends string>(json: T, path: P): JSONPathValue<T, P> {
        return JSONPathPlus({ json: json as JSONPathOptions['path'], path, wrap: false })
    },
}
