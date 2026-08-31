#!/usr/bin/env node
// One-time migration: reads the vocabulary array out of the prototype
// reference copy at the project root (read-only, never modified) and
// writes it as data/vocab.ts. Run once; data/vocab.ts is committed
// normally after that.
import fs from 'node:fs'
import path from 'node:path'

const SOURCE = process.argv[2] || path.resolve('english-vocab.html')
const OUT_DIR = path.resolve('data')

const html = fs.readFileSync(SOURCE, 'utf8')
const script = html.match(/<script>([\s\S]*)<\/script>/)[1]

function extractArray(varName) {
  const re = new RegExp(`const ${varName} = (\\[[\\s\\S]*?\\n  \\]);`)
  const match = script.match(re)
  if (!match) throw new Error(`Could not find "const ${varName} = [...]" in ${SOURCE}`)
  // eslint-disable-next-line no-new-func -- trusted local file, run once at migration time
  return new Function(`return ${match[1]}`)()
}

const DATA = extractArray('DATA')
const vocab = DATA.map(([name, words]) => ({
  name,
  words: words.map(([en, pron, mean]) => ({ en, pron, mean })),
}))

const vocabTs = `export interface VocabWord {
  en: string
  pron: string
  mean: string
}

export interface VocabCategory {
  name: string
  words: VocabWord[]
}

export const VOCAB: VocabCategory[] = ${JSON.stringify(vocab, null, 2)}
`

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, 'vocab.ts'), vocabTs)
console.log(
  `Wrote data/vocab.ts (${vocab.length} categories, ${vocab.reduce((n, c) => n + c.words.length, 0)} words)`
)
