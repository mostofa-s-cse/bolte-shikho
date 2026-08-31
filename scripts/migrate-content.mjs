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
  // `new Function` is deliberate: the source is a trusted local file and this
  // script runs once, by hand, at migration time. (No eslint-disable needed —
  // `no-new-func` is not enabled by eslint-config-next.)
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

// ---- 30-day plan tasks ----
const PLAN = extractArray('PLAN')
const planTasks = PLAN.map((day) => day.tasks)
const planTs = `export const PLAN_TASKS: string[][] = ${JSON.stringify(planTasks, null, 2)}\n`
fs.writeFileSync(path.join(OUT_DIR, 'plan-tasks.ts'), planTs)
console.log(`Wrote data/plan-tasks.ts (${planTasks.length} days)`)

// ---- Daily writing prompts ----
const PROMPTS = extractArray('PROMPTS')
const promptsTs = `export const PROMPTS: string[] = ${JSON.stringify(PROMPTS, null, 2)}\n`
fs.writeFileSync(path.join(OUT_DIR, 'prompts.ts'), promptsTs)
console.log(`Wrote data/prompts.ts (${PROMPTS.length} prompts)`)
