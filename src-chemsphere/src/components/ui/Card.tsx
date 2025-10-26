import React from 'react'

export default function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  // Use Bootstrap card
  return (
    <div className={`card ${className||''}`}>
      <div className="card-body">{children}</div>
    </div>
  )
}
