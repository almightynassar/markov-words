import * as Markov from './typings/Markov'
/**
 * almighty-markov-words
 *
 * Based off of name_generator.js
 * written and released to the public domain by drow <drow@bin.sh>
 */

/**
 * Chain types
 */
export type ChainType = 'ends' | 'letters' | 'meta'

/**
 * Our initial state
 */
const INIT_STATE: Markov.Data = {
  ends: {},
  letters: {},
  meta: {
    sum: 0,
    total: 0,
    average: 0,
    min: Infinity,
    max: 0,
  },
}

export default class MarkovWords {
  /**
   * Stores the number of layers to generate letter links
   */
  private layers: number

  /**
   * Stores the total number of attempts
   */
  private totalAttempts: number

  /**
   * Stores all our required data
   */
  public data: Markov.Data

  /**
   * Creates a blank instance of Markov generator.
   *
   * @param {Array<string>} list
   * @param {number} layers
   */
  constructor(list?: Array<string>, layers: number = 2, totalAttempts: number = 5) {
    this.layers = layers
    this.totalAttempts = totalAttempts
    this.data = INIT_STATE
    if (Array.isArray(list)) {
      this.rebuild(list)
    }
  }

  /**
   * Reset all data
   */
  public reset() {
    this.data = INIT_STATE
  }

  /**
   * Rebuild the whole array from scratch (include scaling)
   *
   * @param {Array<string>} list The name list
   */
  public rebuild(list?: Array<string>) {
    this.reset()
    if (Array.isArray(list)) {
      this.build(list)
      this.scaleWeights()
    }
  }

  /**
   * Builds the data (NO SCALING!)
   *
   * @param Array<string> List of names or words
   */
  public build(list: Array<string>) {
    // Iterate over the given list
    list.forEach((word) => {
      // Initialise our keys
      let tokens = []
      for (let i = 0; i < this.layers; i++) {
        tokens[i] = ''
      }
      let idx = 0
      // Generate the raw data
      word.split('').forEach((letter) => {
        // If we are at the end, save to ends chain. Otherwise, letters
        idx++
        let chain: ChainType = idx !== word.length ? 'letters' : 'ends'
        // Ensure we have keys
        this.initialiseToken(chain, tokens, letter)
        // Increment the value
        this.incrementToken(chain, tokens, letter)
        // Shuffle our token keys
        for (let i = 0; i < this.layers; i++) {
          tokens[i] = i === this.layers - 1 ? letter : tokens[i + 1]
        }
      })
      // Add the words length to sum
      this.data.meta.sum += word.length
      if (word.length > this.data.meta.max) this.data.meta.max = word.length
      if (word.length < this.data.meta.min) this.data.meta.min = word.length
    })
    // Save how many words were processed
    this.data.meta.total += list.length
    this.data.meta.average = Math.round(this.data.meta.sum / this.data.meta.total)
  }

  /**
   * Scale the weights (do once after completed build)
   *
   * @memberof MarkovWords
   */
  public scaleWeights() {
    for (let chain of ['ends', 'letters']) {
      this.recursiveScaling(this.data[chain])
    }
  }

  /**
   * Generate a word
   *
   * @param {number} desiredLength
   */
  public generate(desiredLength?: number) {
    // Initialise our keys
    let tokens = []
    for (let i = 0; i < this.layers; i++) {
      tokens[i] = ''
    }
    // Set up the variables
    let name = ''
    let length =
      typeof desiredLength == 'number'
        ? desiredLength
        : Math.floor(Math.random() * (this.data.meta.max - this.data.meta.min + 1) + this.data.meta.min)
    let attempts = 0
    // Ending found variable
    let endingFound = false
    while (!endingFound) {
      // Find a letter
      let token = this.selectToken('letters', tokens)
      if (token !== '�') {
        name += token
        // Shuffle our token keys
        for (let i = 0; i < this.layers; i++) {
          tokens[i] = i === this.layers - 1 ? token : tokens[i + 1]
        }
        continue
      }
      // Should we look for an ending?
      if (name.length > length - 1 || token == '�') {
        let ending = this.selectToken('ends', tokens)
        if (ending !== '�') {
          name += ending
          endingFound = true
          continue
        }
      }
      // If we got to here, we could not find something
      attempts++
      if (attempts >= this.totalAttempts) {
        name += token
        endingFound = true
        continue
      }
      // Chop out some text and try again
      const runItBack = attempts < name.length - 1 ? attempts : 1
      name = name.substring(0, name.length - runItBack)
      // Shuffle our token keys
      for (let i = this.layers - 1; i >= 0; i--) {
        tokens[i] = name.charAt(name.length - (tokens.length - i))
      }
    }
    return name
  }

  /**
   * Generate a list of words
   *
   * @param {number} total
   * @param {number} desiredLength
   *
   * @return Array<string>
   */
  public generateList(total: number = 10, desiredLength?: number) {
    let list = []
    for (let i = 0; i < total; i++) {
      list.push(this.generate(desiredLength))
    }
    return list
  }

  /**
   * Initiliase the token in the chain array
   *
   * @param {ChainType} chain
   * @param {Array<string>} tokens
   * @param {string} token
   */
  private initialiseToken(chain: ChainType, tokens: Array<string>, letter: string) {
    let reference = this.data[chain]
    for (let i = 0; i < this.layers; i++) {
      if (i === this.layers - 1) {
        if (!reference[tokens[i]]) reference[tokens[i]] = {}
        if (!reference[tokens[i]].weights) reference[tokens[i]].weights = {}
        if (!reference[tokens[i]].scale) reference[tokens[i]].scale = 0
        if (!reference[tokens[i]].weights[letter]) reference[tokens[i]].weights[letter] = 0
      } else {
        if (!reference[tokens[i]]) reference[tokens[i]] = {}
      }
      reference = reference[tokens[i]]
    }
  }

  /**
   * Increment the weight of a token
   *
   * @param {ChainType} chain
   * @param {Array<string>} tokens
   * @param {string} token
   */
  private incrementToken(chain: ChainType, tokens: Array<string>, letter: string) {
    let reference = this.data[chain]
    for (let i = 0; i < this.layers; i++) {
      if (i === this.layers - 1) {
        reference[tokens[i]].weights[letter]++
      }
      reference = reference[tokens[i]]
    }
  }

  /**
   * Allows us to recursively iterate over many different children elements
   *
   * @param reference
   */
  private recursiveScaling(reference: object) {
    if (reference.hasOwnProperty('weights')) {
      for (const [letter, count] of Object.entries(reference['weights'])) {
        if (typeof count == 'number') {
          let weighted = Math.floor(Math.pow(count, 1.3))
          reference['weights'][letter] = weighted
          reference['scale'] += weighted
        }
      }
    } else {
      for (const child in reference) {
        this.recursiveScaling(reference[child])
      }
    }
  }

  /**
   * Select a token from a chain
   *
   * @param {string} chain
   * @param {Array<string>} tokens
   *
   * @return String
   */
  private selectToken(chain: string, tokens: Array<string>) {
    try {
      // Make sure the tokens exists
      if (this.data.hasOwnProperty(chain)) {
        // Set our reference
        let reference = this.data[chain]
        tokens.forEach((element) => {
          reference = reference[element]
        })
        // Make sure our weights exist
        if (reference) {
          if (reference.hasOwnProperty('weights') && reference.hasOwnProperty('scale')) {
            // Randomly generate a number
            const rndm = Math.floor(Math.random() * reference['scale'])
            // Find the letter that has a weight value larger than our random value
            let index = 0
            for (const [letter, weight] of Object.entries(reference['weights'])) {
              if (typeof weight == 'number') {
                index += weight
                if (rndm <= index) {
                  return letter
                }
              }
            }
          } else {
            throw new Error("MarkovWords.selectToken: weights dont' exits")
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
    return '�'
  }
}
