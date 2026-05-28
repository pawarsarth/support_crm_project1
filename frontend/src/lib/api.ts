const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Ticket {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  status: string;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  description: string;
  updated_at: string;
  notes: Note[];
}

export interface Note {
  id: number;
  note_text: string;
  created_at: string;
}

export const api = {
  async getTickets(params?: { status?: string; search?: string }): Promise<Ticket[]> {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const res = await fetch(`${BASE}/api/tickets?${q}`);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  async getTicket(id: string): Promise<TicketDetail> {
    const res = await fetch(`${BASE}/api/tickets/${id}`);
    if (!res.ok) throw new Error('Ticket not found');
    return res.json();
  },

  async createTicket(data: {
    customer_name: string;
    customer_email: string;
    subject: string;
    description: string;
  }) {
    const res = await fetch(`${BASE}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create ticket');
    return json;
  },

  async updateTicket(id: string, data: { status?: string; note_text?: string }) {
    const res = await fetch(`${BASE}/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update ticket');
    return json;
  },
};
