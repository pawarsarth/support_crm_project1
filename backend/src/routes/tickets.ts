import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateTicketId } from '../lib/utils';

const router = Router();

// GET /api/tickets — list with optional ?status= and ?search=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
        { ticket_id: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        ticket_id: true,
        customer_name: true,
        customer_email: true,
        subject: true,
        status: true,
        created_at: true,
      },
    });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// POST /api/tickets — create a new ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_email, subject, description } = req.body;

    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        ticket_id: generateTicketId(),
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        subject: subject.trim(),
        description: description.trim(),
        status: 'OPEN',
      },
    });

    res.status(201).json({ ticket_id: ticket.ticket_id, created_at: ticket.created_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /api/tickets/:ticket_id — get single ticket with notes
router.get('/:ticket_id', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: req.params.ticket_id },
      include: { notes: { orderBy: { created_at: 'desc' } } },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// PUT /api/tickets/:ticket_id — update status and/or add note
router.put('/:ticket_id', async (req: Request, res: Response) => {
  try {
    const { status, note_text } = req.body;
    const { ticket_id } = req.params;

    const existing = await prisma.ticket.findUnique({ where: { ticket_id } });
    if (!existing) return res.status(404).json({ error: 'Ticket not found' });

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await prisma.ticket.update({
      where: { ticket_id },
      data: { ...(status && { status }) },
    });

    if (note_text && note_text.trim()) {
      await prisma.note.create({
        data: { ticket_id, note_text: note_text.trim() },
      });
    }

    res.json({ success: true, updated_at: updated.updated_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

export default router;
