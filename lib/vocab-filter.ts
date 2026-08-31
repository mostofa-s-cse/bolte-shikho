import type { VocabCategory } from '@/data/vocab'

export function filterVocab(
  categories: VocabCategory[],
  query: string,
  activeCategory: string
): VocabCategory[] {
  const q = query.trim().toLowerCase()

  return categories
    .filter((category) => activeCategory === 'All' || activeCategory === category.name)
    .map((category) => ({
      ...category,
      words: category.words.filter(
        (word) =>
          !q ||
          word.en.toLowerCase().includes(q) ||
          word.pron.includes(q) ||
          word.mean.includes(q)
      ),
    }))
    .filter((category) => category.words.length > 0)
}
