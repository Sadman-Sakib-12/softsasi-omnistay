import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { ISupportRepository } from '../../domain/repositories/support.repository.interface.js';

function normalizeTenantId(id?: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return '55c3849e-0fa3-4b52-9c2d-b4cbe23e9525';
}

@Injectable()
export class PrismaSupportRepository implements ISupportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countTickets(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    return this.prisma.supportTicket.count({ where: { tenantId: tid } });
  }

  async createTicket(data: {
    tenantId: string;
    ticketCode: string;
    guestName: string;
    guestEmail?: string;
    subject: string;
    priority: string;
    status: string;
  }) {
    return this.prisma.supportTicket.create({
      data: {
        ...data,
        tenantId: normalizeTenantId(data.tenantId),
      },
      include: { replies: true },
    });
  }

  async findTickets(tenantId: string) {
    const tid = normalizeTenantId(tenantId);
    let tickets = await this.prisma.supportTicket.findMany({
      where: { tenantId: tid },
      include: { replies: true },
      orderBy: { createdAt: 'desc' },
    });

    if (tickets.length === 0) {
      const seedTickets = [
        {
          ticketCode: 'TCK-2026-1001',
          guestName: 'Lady Eleanor Vance',
          guestEmail: 'eleanor.vance@vancemedia.co.uk',
          subject: 'Suite 402 AC Not Cooling Below 25°C',
          priority: 'urgent',
          status: 'open',
          replies: [
            {
              senderType: 'guest',
              message:
                'Good evening. The digital thermostat in Suite 402 seems locked at 25°C. Room is uncomfortably warm.',
            },
            {
              senderType: 'staff',
              message:
                'Dispatched Senior HVAC Maintenance Technician with replacement digital controller. ETA 8 minutes under urgent 20-min SLA.',
            },
          ],
        },
        {
          ticketCode: 'TCK-2026-1002',
          guestName: 'Dr. Marcus Sterling',
          guestEmail: 'm.sterling@fintechcap.com',
          subject: 'Room 214 RFID Keycard Reader Timed Out',
          priority: 'urgent',
          status: 'in_progress',
          replies: [
            {
              senderType: 'guest',
              message: 'RFID keycard reader is flashing orange and does not open door upon return from dinner.',
            },
            {
              senderType: 'staff',
              message:
                'Duty Assistant Manager en route with physical override bypass key and re-programmed RFID keycards. ETA 5 minutes.',
            },
          ],
        },
        {
          ticketCode: 'TCK-2026-1003',
          guestName: 'Sophia Lorenzi',
          guestEmail: 'sophia@lorenzidesign.it',
          subject: 'Mercedes-Maybach Chauffeur Transfer for 4:30 AM Flight Departure',
          priority: 'high',
          status: 'resolved',
          replies: [
            {
              senderType: 'guest',
              message: 'Confirming airport transfer for early morning international flight at 7:00 AM.',
            },
            {
              senderType: 'staff',
              message:
                'Reserved Mercedes S-Class limousine with chauffeur Carlos at Portico for 4:30 AM sharp. Wake-up call set for 3:45 AM.',
            },
          ],
        },
        {
          ticketCode: 'TCK-2026-1004',
          guestName: 'Alexander Wright',
          guestEmail: 'a.wright@genevawatch.ch',
          subject: 'Complimentary Late Check-out Request until 2:30 PM',
          priority: 'normal',
          status: 'resolved',
          replies: [
            {
              senderType: 'guest',
              message: 'Can I please have late check-out till 2:30 PM due to afternoon conference call?',
            },
            {
              senderType: 'staff',
              message:
                'Granted complimentary for VIP Silver guest. Your RFID room keycard has been extended until 2:30 PM.',
            },
          ],
        },
      ];

      for (const t of seedTickets) {
        const { replies, ...ticketData } = t;
        const created = await this.prisma.supportTicket.create({
          data: {
            ...ticketData,
            tenantId: tid,
          },
        });

        for (const r of replies) {
          await this.prisma.supportTicketReply.create({
            data: {
              ticketId: created.id,
              senderType: r.senderType,
              message: r.message,
            },
          });
        }
      }

      tickets = await this.prisma.supportTicket.findMany({
        where: { tenantId: tid },
        include: { replies: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return tickets;
  }

  async findTicketById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: { replies: true },
    });
  }

  async addReply(data: { ticketId: string; senderType: string; message: string }) {
    return this.prisma.supportTicketReply.create({ data });
  }

  async updateTicket(id: string, data: Record<string, any>) {
    return this.prisma.supportTicket.update({
      where: { id },
      data,
    });
  }

  async createCannedResponse(data: { shortcut: string; title: string; response: string }) {
    return this.prisma.supportCannedResponse.create({ data });
  }

  async findCannedResponses() {
    let responses = await this.prisma.supportCannedResponse.findMany();

    if (responses.length === 0) {
      const defaultCanned = [
        {
          shortcut: '/checkout',
          title: 'Complimentary Late Check-Out (Chapter 11.5)',
          response:
            'Good day! Late check-out up to 2:00 PM has been extended for your suite complimentary. Enjoy your remaining time at OmniStay!',
        },
        {
          shortcut: '/airport',
          title: 'Luxury Limousine Chauffeur (Chapter 11.5)',
          response:
            'Our concierge chauffeur will meet you at the arrivals terminal holding an OmniStay iPad sign with your name. Safe travels!',
        },
        {
          shortcut: '/pool',
          title: 'Infinity Pool & Cabana Hours (Chapter 11.5)',
          response:
            'The Infinity Horizon Pool and Cabana Bar are open daily from 6:30 AM to 10:00 PM. Towels and fresh fruit water are complimentary.',
        },
        {
          shortcut: '/allergens',
          title: 'Executive Chef Allergen Safeguard (Chapter 11.5)',
          response:
            'Our Executive Culinary Team has been alerted with your dietary restrictions and will prepare dedicated allergen-safe courses.',
        },
      ];

      for (const c of defaultCanned) {
        await this.prisma.supportCannedResponse.upsert({
          where: { shortcut: c.shortcut },
          update: c,
          create: c,
        });
      }

      responses = await this.prisma.supportCannedResponse.findMany();
    }

    return responses;
  }

  async createKnowledgeBase(data: { category: string; question: string; answer: string }) {
    return this.prisma.supportKnowledgeBase.create({ data });
  }

  async findKnowledgeBase(category?: string) {
    let items = await this.prisma.supportKnowledgeBase.findMany({
      where: category ? { category } : undefined,
    });

    if (items.length === 0) {
      const defaultKB = [
        {
          category: 'Facilities & Amenities',
          question: 'What are the Infinity Pool and Fitness Center hours?',
          answer:
            'Open daily 24 hours for gym with room keycard; pool operates 06:30 to 22:00.',
        },
        {
          category: 'Concierge & Transport',
          question: 'How can I book private luxury airport limousine transfer?',
          answer:
            'Contact Concierge via dial 0 or through the guest app. Mercedes S-Class and V-Class available 24/7.',
        },
        {
          category: 'Dining & Room Service',
          question: 'Is 24-hour in-room dining available?',
          answer:
            'Yes, our overnight culinary menu is available 24/7 via the in-room tablet or dial 4.',
        },
        {
          category: 'Billing & USALI Accounts',
          question: 'Can dining and spa expenses be charged directly to my room folio?',
          answer:
            'Yes, present your room keycard and sign the bill folio at any F&B outlet or spa reception.',
        },
      ];

      for (const kb of defaultKB) {
        await this.prisma.supportKnowledgeBase.create({ data: kb });
      }

      items = await this.prisma.supportKnowledgeBase.findMany({
        where: category ? { category } : undefined,
      });
    }

    return items;
  }
}
