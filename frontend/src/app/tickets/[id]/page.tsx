'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api, TicketDetail } from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTicket = async () => {
    try {
      const data = await api.getTicket(id);
      setTicket(data);
      setStatus(data.status);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTicket(); }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.updateTicket(id, { status, note_text: noteText });
      showToast('Ticket updated successfully!', 'success');
      setNoteText('');
      await loadTicket();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <><Navbar /><main className="container"><div className="loading"><div className="spinner" /></div></main></>
  );

  if (notFound || !ticket) return (
    <><Navbar /><main className="container">
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-dim)' }}>Ticket not found</div>
        <Link href="/" className="btn btn-ghost" style={{ marginTop: 12, display: 'inline-flex' }}>← Back to tickets</Link>
      </div>
    </main></>
  );

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <nav className="breadcrumb">
            <Link href="/">Tickets</Link>
            <span className="bc-sep">/</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--accent)' }}>{ticket.ticket_id}</span>
          </nav>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 className="page-title" style={{ fontSize: '1.55rem' }}>{ticket.subject}</h1>
              <p className="page-subtitle">Opened {formatDate(ticket.created_at)}</p>
            </div>
            <span className={`badge ${getStatusColor(ticket.status)}`} style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 6 }}>
              {getStatusLabel(ticket.status)}
            </span>
          </div>
        </div>

        <div className="detail-grid">
          {/* Left column */}
          <div>
            <div className="card">
              <div className="card-title">Ticket Details</div>
              <div className="dfield">
                <div className="dkey">Ticket ID</div>
                <div className="dval mono">{ticket.ticket_id}</div>
              </div>
              <div className="dfield">
                <div className="dkey">Customer</div>
                <div className="dval">{ticket.customer_name}</div>
              </div>
              <div className="dfield">
                <div className="dkey">Email</div>
                <div className="dval">{ticket.customer_email}</div>
              </div>
              <div className="dfield">
                <div className="dkey">Description</div>
                <div className="dval muted">{ticket.description}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="dfield" style={{ marginBottom: 0 }}>
                  <div className="dkey">Created</div>
                  <div className="dval" style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
                <div className="dfield" style={{ marginBottom: 0 }}>
                  <div className="dkey">Last Updated</div>
                  <div className="dval" style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDate(ticket.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Notes ({ticket.notes.length})</div>
              {ticket.notes.length === 0 ? (
                <div className="notes-empty">No notes yet — add one to track progress.</div>
              ) : (
                ticket.notes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-text">{note.note_text}</div>
                    <div className="note-time">{formatDate(note.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            <div className="card">
              <div className="card-title">Update Ticket</div>
              <div className="fg" style={{ marginBottom: 18 }}>
                <label className="form-label">Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="fg" style={{ marginBottom: 18 }}>
                <label className="form-label">Add Note</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add an internal note or update…"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  style={{ minHeight: 110 }}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <Link href="/" className="btn btn-ghost" style={{ width: '100%' }}>← Back to All Tickets</Link>
            </div>
          </div>
        </div>
        <div style={{ height: 52 }} />
      </main>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
