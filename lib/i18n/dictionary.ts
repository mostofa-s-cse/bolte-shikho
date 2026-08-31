import bn from '@/dictionaries/bn.json'
import en from '@/dictionaries/en.json'
import type { Locale } from './locale-routing'

export type Dictionary = typeof bn

export const DICTIONARIES: Record<Locale, Dictionary> = { bn, en }
