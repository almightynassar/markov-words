# markov-words
Generate words based off an input list (i.e. list of names)

## Installing

`npm install --save markov-words`

## Usage

```js
const Markov = require('markov-words').default
// or
import Markov from 'markov-words'

const data = [/* insert a few hundreds/thousands sentences here */]

// Build the Markov generator
const markov = new Markov(data)

// Generate a word
const result = markov.generate()
console.log(result)
```
