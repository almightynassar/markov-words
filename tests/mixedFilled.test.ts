import MarkovWords from '../src'
import popular1900boys from './data/popular1900boys'
import persianboys from './data/persianboys'

const markov = new MarkovWords([], 3)
markov.build(Object.keys(popular1900boys))
markov.build(persianboys)
markov.scaleWeights()

describe('Filled Mixed Lists', () => {
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
