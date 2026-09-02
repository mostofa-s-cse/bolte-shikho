import { Mail } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'

const SUPPORT_EMAIL = 'boltesikho.support@gmail.com'

export async function SiteFooter() {
  const t = await getDictionary()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-sm text-ink-muted sm:flex-row sm:justify-between">
        <span>
          © {year} {t.header.brand}. {t.footer.rights}
        </span>
        <span className="flex items-center gap-2">
          {t.footer.supportLabel}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-1 text-accent hover:underline"
          >
            <Mail size={14} />
            {SUPPORT_EMAIL}
          </a>
        </span>
      </div>
    </footer>
  )
}
