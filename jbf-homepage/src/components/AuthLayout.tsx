import type { ReactNode } from 'react'

interface Props {
  title: string
  text: string
  children: ReactNode
}

/** Blurred backdrop + two-panel card shared by every auth screen. */
export default function AuthLayout({ title, text, children }: Props) {
  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true" />
      <main className="auth-card">
        <aside className="auth-side">
          <h1>{title}</h1>
          <span className="auth-bar" />
          <p>{text}</p>
        </aside>
        <section className="auth-main">{children}</section>
      </main>
    </div>
  )
}
