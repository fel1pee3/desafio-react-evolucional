import type { ReactNode } from 'react'

type AlertProps = {
  title: string
  children: ReactNode
  action?: ReactNode
  tone?: 'error' | 'info' | 'success'
}

export function Alert({
  title,
  children,
  action,
  tone = 'info',
}: AlertProps) {
  return (
    <div
      className={`alert alert--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div>
        <h2 className="alert__title">{title}</h2>
        <div className="alert__content">{children}</div>
      </div>
      {action ? <div className="alert__action">{action}</div> : null}
    </div>
  )
}
