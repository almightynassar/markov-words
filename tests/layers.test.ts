import MarkovWords from '../src'
import loremipsum from './data/loremipsum'

const markov = new MarkovWords(loremipsum, 3)

describe('Filled Constructor', () => {
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
    const list = markov.generateList()
    expect(list).toHaveLength(10)
  })
})
