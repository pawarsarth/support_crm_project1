'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api, Ticket } from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'];

export default function HomePage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [dSearch, setDSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDSearch(search), 320);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTickets({ status: filter, search: dSearch });
      setTickets(data);
    } catch { setTickets([]); }
    finally { setLoading(false); }
  }, [filter, dSearch]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    prog: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Track and resolve every customer request</p>
        </div>

        <div className="stats-row">
          {[
            { label: 'Total', val: counts.total, cls: 'c-total' },
            { label: 'Open', val: counts.open, cls: 'c-open' },
            { label: 'In Progress', val: counts.prog, cls: 'c-prog' },
            { label: 'Closed', val: counts.closed, cls: 'c-closed' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className={`stat-number ${s.cls}`}>{s.val}</div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search by name, email, ID or subject…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`ftab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : getStatusLabel(f)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : tickets.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🎫</div>
              <div className="empty-title">No tickets found</div>
              <p style={{fontSize:'0.82rem',marginTop:6}}>
                {search || filter !== 'ALL' ? 'Try a different search or filter.' : 'Create your first support ticket.'}
              </p>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.ticket_id} onClick={() => router.push(`/tickets/${t.ticket_id}`)}>
                    <td><span className="tid">{t.ticket_id}</span></td>
                    <td>
                      <div className="cname">{t.customer_name}</div>
                      <div className="cemail">{t.customer_email}</div>
                    </td>
                    <td><span className="subj">{t.subject}</span></td>
                    <td><span className={`badge ${getStatusColor(t.status)}`}>{getStatusLabel(t.status)}</span></td>
                    <td><span className="dtext">{formatDate(t.created_at)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{height:48}} />
      </main>
    </>
  );
}
