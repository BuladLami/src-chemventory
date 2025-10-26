import React from 'react'
import clsx from 'clsx'

export default function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  // Map safety classes to Bootstrap badge colors via className passed from callers
  return (
    <span className={clsx('badge', className)}>{children}</span>
  )
}
