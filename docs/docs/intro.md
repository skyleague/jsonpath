---
sidebar_position: 0
title: Overview
slug: /
---

# Introduction

JSONPath is a syntax for specifying locations in a JSON document. It allows you to specify a path to a value within the document, using a set of rules and conventions.

## Syntax
A JSONPath expression consists of a path, which is a series of keys or array indices, separated by dots. A key can be either a string, or an integer representing the index of an element in an array. A path can also include wildcards, which can match multiple keys or indices.

## Examples
Here are some examples of valid JSONPath expressions:

* `$.store.book[0].title`: This expression selects the title property of the first element in the book array, which is a property of the store object.
* `$..author`: This expression selects all author properties in the document, regardless of their location.
* `$.store.*`: This expression selects all properties of the store object.

## Conventions
* A `$` character at the beginning of a path represents the root of the document.
* A `..` token can be used to select all the children and descendants of the current node in the JSON data.
* Square brackets `[]` can be used to select elements of an array by index.
* A `*` wildcard can be used to match any element in an array, or any property of an object.