'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n/locale-context'

const noopSubscribe = () => () => {}

// next-themes seeds its state from localStorage on the client's very first
// render, so `resolvedTheme` can disagree with the server-rendered HTML. The
// icon therefore has to stay theme-neutral until hydration finishes.
// useSyncExternalStore gives us that flag without a setState-in-effect:
// React uses getServerSnapshot (false) for SSR and the hydration render, then
// getSnapshot (true) once hydrated.
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const { t } = useTranslations()

  const isDark = hydrated && resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={t.header.toggleTheme}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
