import * as React from 'react'
import { cn } from '@/lib/utils'

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn('h-[18px] w-[18px] accent-accent', className)}
      {...props}
    />
  )
)
Checkbox.displayName = 'Checkbox'
