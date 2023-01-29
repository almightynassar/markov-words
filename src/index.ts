/**
 * almighty-markov-words
 *
 * Based off of name_generator.js
 * written and released to the public domain by drow <drow@bin.sh>
 */

/**
 * Markov Token store
 */
export type MarkovToken = {
  [key: string]: number
}

/**
 * Markov Weight store
 */
export type MarkovWeight = {
  weights: MarkovToken
  scale: number
}

/**
 * Markov Parent store
 */
export type MarkovParent = {
  [key: string|null|undefined]: MarkovWeight
}

/**
 * Markov Meta store
 */
export type MarkovMeta = {
  sum: number
  total: number
  average: number
  min: number
  max: number
}

/**
 * Our Markov data store
 */
export type MarkovData = {
  "ends": {
    [key: string|null|undefined]: MarkovParent
  }
  "letters": {
    [key: string|null|undefined]: MarkovParent
  }
  "meta": MarkovMeta
}

export default class MarkovWords {
  /**
   * Stores all our required data
   */
  public data: MarkovData

  /**
   * Creates a blank instance of Markov generator.
   *
   * @memberof MarkovWords
   */
  constructor(list?: Array<string>) {
    this.rebuild(list)
  }

  /**
   * Reset all data
   *
   * @memberof MarkovWords
   */
  public reset() {
    this.data = {
      ends: {},
      letters: {},
      meta: {
        sum: 0,
        total: 0,
        average: 0,
        min: Infinity,
        max: 0,
      }
    }
  }

  /**
   * Rebuild the whole array from scratch (include scaling)
   *
   * @param list The name list
   */
  public rebuild(list?: Array<string>){
    this.reset()
    if (Array.isArray(list)) this.build(list)
    this.scaleWeights()
  }

  /**
   * Builds the data (NO SCALING!)
   *
   * @param Array<string> List of names or words
   */
  public build(list?: Array<string>) {
    // Iterate over the given list
    list.forEach(word => {
      // Initialise our keys
      let grandparent = ""
      let parent = ""
      let idx = 0
      // Generate the raw data
      word.split('').forEach(letter => {
        // If we are at the end, save to ends chain. Otherwise, letters
        idx++
        let chain = (idx !== word.length) ? 'letters' : 'ends'
        // Ensure we have keys
        this.initialiseToken(chain, grandparent, parent, letter)
        // Increment the value
        this.data[chain][grandparent][parent]['weights'][letter]++
        // Shuffle our keys
        grandparent = parent
        parent = letter
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
    for (const chain of ["ends", "letters"]) {
      for (const grandparent in this.data[chain]) {
        for (const parent in this.data[chain][grandparent]) {
          for (const [letter, count] of Object.entries(this.data[chain][grandparent][parent].weights)) {
            if (typeof count == "number") {
              let weighted = Math.floor(Math.pow(count, 1.3))
              this.data[chain][grandparent][parent].weights[letter] = weighted
              this.data[chain][grandparent][parent].scale += weighted
            }
          }
        }
      }
    }
  }

  /**
   * Generate a word
   *
   * @param totalAttempts Number of total attempts
   *
   * @return string
   */
  public generate(totalAttempts:number = 5) {
    // Set up the variables
    let grandparent = ''
    let parent = ''
    let name = ''
    let length = Math.floor(Math.random() * (this.data.meta.max - this.data.meta.min + 1) + this.data.meta.min)
    let attempts = 0
    // Ending found variable
    let endingFound = false
    while (!endingFound) {
      // Should we look for an ending?
      if (name.length > (length - 1)) {
        let ending = this.selectToken('ends', grandparent, parent)
        if (ending !== '~') {
          name += ending
          endingFound = true
          continue
        }
      }
      // Find a letter
      let token = this.selectToken('letters', grandparent, parent)
      if (token !== '~') {
        name += token
        grandparent = parent
        parent = token
        continue
      }
      // If we got to here, we could not find something
      attempts++
      if (attempts >= totalAttempts) {
        endingFound = true
        continue
      }
      name = name.substring(0, name.length - 1)
      parent = name.charAt(name.length - 1)
      grandparent = name.charAt(name.length - 2)
    }
    return name
  }

  /**
   * Generate a list of words
   *
   * @param total
   * @param totalAttempts
   *
   * @return Array<string>
   */
  public generateList(total:number = 10, totalAttempts:number = 5) {
    let list = []
    for (let i = 0; i < total; i++) {
      list.push(this.generate(totalAttempts))
    }
    return list
  }

  /**
   * Initiliase the token in the chain array
   *
   * @param chain
   * @param grandparent
   * @param parent
   * @param token
   */
  private initialiseToken(chain:string, grandparent:string, parent:string, token:string) {
    if (!this.data[chain][grandparent]) this.data[chain][grandparent] = {}
    if (!this.data[chain][grandparent][parent]) this.data[chain][grandparent][parent] = {}
    if (!this.data[chain][grandparent][parent].weights) this.data[chain][grandparent][parent].weights = {}
    if (!this.data[chain][grandparent][parent].scale) this.data[chain][grandparent][parent].scale = 0
    if (!this.data[chain][grandparent][parent].weights[token]) this.data[chain][grandparent][parent].weights[token] = 0
  }

  /**
   * Select a token from a chain
   *
   * @param chain
   * @param grandparent
   * @param parent
   *
   * @return String
   */
  private selectToken(chain:string, grandparent:string, parent:string) {
    // Make sure the tokens exists
    if (this.data[chain][grandparent]) {
      if (this.data[chain][grandparent][parent]) {
        const rndm = Math.floor(Math.random() * this.data[chain][grandparent][parent].scale)
        let index = 0
        for (const [letter, weight] of Object.entries(this.data[chain][grandparent][parent].weights)) {
          if (typeof weight == "number") {
            index += weight
            if (rndm < index) {
              return letter
            }
          }
        }
      }
    }
    return '~'
  }
}
