import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function DashboardPage() {
  const { session } = useAuth()
  const [counts, setCounts] = useState({ messages: null, pathways: null })

  useEffect(() => {
    async function fetchCounts() {
      const [{ count: messages }, { count: pathways }] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('learning_pathways').select('*', { count: 'exact', head: true }),
      ])
      setCounts({ messages: messages ?? 0, pathways: pathways ?? 0 })
    }
    fetchCounts()
  }, [])

  const firstName = session?.user?.email?.split('@')[0] ?? 'Admin'

  const cards = [
    {
      to: '/admin/messages',
      label: 'Messages',
      description: 'Contact form submissions from the website.',
      count: counts.messages,
      color: 'var(--sea)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      to: '/admin/pathways',
      label: 'Learning Pathways',
      description: 'Manage Pasifika language learning resources.',
      count: counts.pathways,
      color: 'var(--violet)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page__sub">Welcome back, {firstName}.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="dashboard-card" style={{ '--card-color': card.color }}>
            <div className="dashboard-card__icon">{card.icon}</div>
            <div className="dashboard-card__body">
              <strong>{card.label}</strong>
              <p>{card.description}</p>
            </div>
            <div className="dashboard-card__count">
              {card.count === null ? '—' : card.count}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
