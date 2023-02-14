import MarkovWords from '../src'

const data = [
  'ad',
  'adipiscing',
  'aliqua',
  'aliquip',
  'amet',
  'anim',
  'aute',
  'bibendum',
  'cillum',
  'commodo',
  'consectetur',
  'consequat',
  'culpa',
  'cupidatat',
  'deserunt',
  'do',
  'dolor',
  'dolore',
  'duis',
  'ea',
  'egestas',
  'eiusmod',
  'elit',
  'enim',
  'erat',
  'eros',
  'esse',
  'est',
  'et',
  'eu',
  'ex',
  'excepteur',
  'exercitation',
  'fugiat',
  'fusce',
  'id',
  'imperdiet',
  'in',
  'incididunt',
  'ipsum',
  'irure',
  'labore',
  'laboris',
  'laborum',
  'lacinia',
  'lacus',
  'lorem',
  'magna',
  'minim',
  'mollit',
  'nisi',
  'non',
  'nostrud',
  'nulla',
  'occaecat',
  'officia',
  'pariatur',
  'pharetra',
  'pretium',
  'proident',
  'qui',
  'quis',
  'reprehenderit',
  'sed',
  'sint',
  'sit',
  'sunt',
  'tempor',
  'tincidunt',
  'ullamco',
  'ut',
  'vel',
  'velit',
  'veniam',
  'voluptate',
]

describe('Markov Words', () => {
  describe('Blank Constructor', () => {
    it('sum should be 0', () => {
      const markov = new MarkovWords()
      expect(markov.data.meta.sum).toBe(0)
    })
    it('total should be 0', () => {
      const markov = new MarkovWords()
      expect(markov.data.meta.total).toBe(0)
    })
  })
  describe('Filled Constructor', () => {
    it('should have sum', () => {
      const markov = new MarkovWords(data)
      expect(markov.data.meta.sum).toBeGreaterThan(0)
    })
    it('should have total', () => {
      const markov = new MarkovWords(data)
      expect(markov.data.meta.total).toBeGreaterThan(0)
    })
    it('should generate word', () => {
      const markov = new MarkovWords(data)
      const name = markov.generate()
      expect(name).toBeDefined()
    })
    it('should generate list of words', () => {
      const markov = new MarkovWords(data)
      const list = markov.generateList()
      expect(list).toHaveLength(10)
    })
  })
})
