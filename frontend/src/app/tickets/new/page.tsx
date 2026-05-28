'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';

interface FormData { customer_name: string; customer_email: string; subject: string; description: string; }
type Errors = Partial<FormData>;

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ customer_name: '', customer_email: '', subject: '', description: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.customer_name.trim()) e.customer_name = 'Full name is required';
    if (!form.customer_email.trim()) e.customer_email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) e.customer_email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const data = await api.createTicket(form);
      showToast(`Ticket ${data.ticket_id} created successfully!`, 'success');
      setTimeout(() => router.push('/'), 1400);
    } catch (err: any) {
      showToast(err.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <nav className="breadcrumb">
            <Link href="/">Tickets</Link>
            <span className="bc-sep">/</span>
            <span>New Ticket</span>
          </nav>
          <h1 className="page-title">Create Ticket</h1>
          <p className="page-subtitle">Open a new customer support request</p>
        </div>

        <div style={{ maxWidth: 700 }}>
          <div className="card">
            <div className="card-title">Customer Information</div>
            <div className="form-grid">
              <div className="fg">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Jane Smith" value={form.customer_name} onChange={set('customer_name')} />
                {errors.customer_name && <span className="form-err">{errors.customer_name}</span>}
              </div>
              <div className="fg">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="jane@example.com" value={form.customer_email} onChange={set('customer_email')} />
                {errors.customer_email && <span className="form-err">{errors.customer_email}</span>}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Issue Details</div>
            <div className="form-grid">
              <div className="fg full">
                <label className="form-label">Subject</label>
                <input className="form-input" placeholder="Brief summary of the issue" value={form.subject} onChange={set('subject')} />
                {errors.subject && <span className="form-err">{errors.subject}</span>}
              </div>
              <div className="fg full">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe the problem in detail…" value={form.description} onChange={set('description')} />
                {errors.description && <span className="form-err">{errors.description}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingBottom: 52 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating…' : 'Create Ticket'}
            </button>
            <Link href="/" className="btn btn-ghost">Cancel</Link>
          </div>
        </div>
      </main>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
