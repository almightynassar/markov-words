import MarkovWords from '../src'

const markov = new MarkovWords()
describe('Blank Constructor', () => {
  it('sum should be 0', () => {
    expect(markov.data.meta.sum).toBe(0)
  })
  it('total should be 0', () => {
    expect(markov.data.meta.total).toBe(0)
  })
})
