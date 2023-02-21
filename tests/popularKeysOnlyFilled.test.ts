import MarkovWords from '../src'
import popular1900boys from './data/popular1900boys'

const markov = new MarkovWords(Object.keys(popular1900boys))

describe('Popular 1900s Boys Filled (Keys)', () => {
  it('should have sum', () => {
    expect(markov.data.meta.sum).toBeGreaterThan(0)
  })
  it('should have total', () => {
    expect(markov.data.meta.total).toBeGreaterThan(0)
  })
  it('should generate word', () => {
    const name = markov.generate()
    expect(name).toBeDefined()
  })
  it('should generate list of words', () => {
    const list = markov.generateList(100)
    expect(list).toHaveLength(100)
  })
})
