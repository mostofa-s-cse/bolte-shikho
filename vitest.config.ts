import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Nested worktrees (e.g. .claude/worktrees/<name>/, created alongside
    // this repo) have their own node_modules and their own copy of every
    // test file. Vitest's default excludes don't know about that
    // directory, so running the suite from the main checkout also picks up
    // the worktree's tests against a different React install — surfacing
    // as bogus "Invalid hook call" and unresolved-import failures that
    // have nothing to do with this checkout.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/.claude/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
