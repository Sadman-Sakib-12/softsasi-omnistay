import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IFormRepository } from '../../domain/repositories/form.repository.interface.js';

@Injectable()
export class PrismaFormRepository implements IFormRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createForm(data: {
    tenantId: string;
    formName: string;
    formSchema: Record<string, any>;
    isActive: boolean;
  }) {
    return this.prisma.formBuilder.create({ data });
  }

  async updateForm(id: string, data: {
    formName?: string;
    formSchema?: Record<string, any>;
    isActive?: boolean;
  }) {
    return this.prisma.formBuilder.update({
      where: { id },
      data,
    });
  }

  async deleteForm(id: string) {
    return this.prisma.formBuilder.delete({
      where: { id },
    });
  }

  async findForms(tenantId: string) {
    const existing = await this.prisma.formBuilder.findMany({
      where: { tenantId },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing.length > 0) {
      return existing;
    }

    // Auto-seed the 4 PDF Master Templates (Chapter 11.4)
    const defaultTemplates = [
      {
        tenantId,
        formName: 'Wedding Banquet & Reception Inquiry (Chapter 11.4)',
        isActive: true,
        formSchema: {
          title: 'Wedding Banquet & Reception Inquiry',
          description: 'Design your dream luxury wedding celebration at OmniStay.',
          fields: [
            { id: 'f-1', name: 'fullName', label: 'Bride / Groom / Organizer Full Name', type: 'text', required: true, placeholder: 'e.g. Jessica & David Vance' },
            { id: 'f-2', name: 'email', label: 'Contact Email Address', type: 'email', required: true, placeholder: 'contact@weddingplanning.com' },
            { id: 'f-3', name: 'phone', label: 'Direct Phone / WhatsApp', type: 'phone', required: true, placeholder: '+1 (555) 345-6789' },
            { id: 'f-4', name: 'eventDate', label: 'Proposed Celebration Date', type: 'date', required: true },
            { id: 'f-5', name: 'headcount', label: 'Expected Headcount (PAX)', type: 'number', required: true, placeholder: '250' },
            { id: 'f-6', name: 'banquetSpace', label: 'Preferred Banquet Venue', type: 'select', required: true, options: ['Grand Crystal Ballroom (Up to 500 PAX)', 'Amber Garden Pavilion (Up to 300 PAX)', 'Rooftop Oceanfront Terrace (Up to 150 PAX)'] },
            { id: 'f-7', name: 'cateringStyle', label: 'Catering & Dining Style', type: 'select', required: true, options: ['5-Course Silver Plated Banquet', 'Royal Gourmet International Buffet', 'Live Chef Action Stations & Canapés'] },
            { id: 'f-8', name: 'specialDietary', label: 'Special Dietary Accommodations', type: 'checkbox', required: false, options: ['Halal Certified', 'Vegetarian / Jain Options', 'Gluten-Free', 'Nut Allergies'] },
            { id: 'f-9', name: 'budget', label: 'Estimated Budget Tier', type: 'select', required: true, options: ['$15,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000+ Platinum VIP'] },
            { id: 'f-10', name: 'notes', label: 'Floral, Stage & Theme Decor Notes', type: 'textarea', required: false, placeholder: 'Describe your vision, colors, and entertainment plans...' },
          ],
        },
      },
      {
        tenantId,
        formName: 'Spa & Ayurvedic Wellness Consultation (Chapter 11.4)',
        isActive: true,
        formSchema: {
          title: 'Spa & Ayurvedic Wellness Intake',
          description: 'Personalized wellness and rejuvenation therapies tailored to your body.',
          fields: [
            { id: 'f-s1', name: 'fullName', label: 'Guest Full Name', type: 'text', required: true, placeholder: 'e.g. Eleanor Vance' },
            { id: 'f-s2', name: 'roomNumber', label: 'Room / Suite Number (If In-House)', type: 'text', required: false, placeholder: 'Villa 402' },
            { id: 'f-s3', name: 'phone', label: 'Contact Phone Number', type: 'phone', required: true, placeholder: '+1 (555) 789-0123' },
            { id: 'f-s4', name: 'appointmentDate', label: 'Preferred Session Date & Time', type: 'date', required: true },
            { id: 'f-s5', name: 'treatmentType', label: 'Desired Treatment & Therapy', type: 'select', required: true, options: ['Signature 90-Min Swedish Body Therapy', 'Deep Tissue Himalayan Salt Stone Therapy', 'Ayurvedic Abhyanga & Shirodhara Rejuvenation', 'Oxygen Radiance Facial & Organic Scrub'] },
            { id: 'f-s6', name: 'therapistGender', label: 'Therapist Gender Preference', type: 'select', required: false, options: ['No Preference', 'Female Therapist', 'Male Therapist'] },
            { id: 'f-s7', name: 'healthConditions', label: 'Health Conditions & Disclosures', type: 'checkbox', required: false, options: ['Hypertension / High BP', 'Pregnancy (First / Second Trimester)', 'Skin Sensitivities & Allergies', 'Recent Surgery / Muscle Strain'] },
            { id: 'f-s8', name: 'notes', label: 'Pressure Preference & Special Focus Areas', type: 'textarea', required: false, placeholder: 'Light / Medium / Firm pressure; focus on lower back and shoulders...' },
          ],
        },
      },
      {
        tenantId,
        formName: 'Post-Stay Guest CSAT & Quality Feedback (Chapter 11.4)',
        isActive: true,
        formSchema: {
          title: 'Post-Stay Guest Feedback Survey',
          description: 'Help us elevate hospitality excellence with your feedback.',
          fields: [
            { id: 'f-c1', name: 'fullName', label: 'Guest Full Name', type: 'text', required: true, placeholder: 'e.g. Robert Langdon' },
            { id: 'f-c2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'guest@example.com' },
            { id: 'f-c3', name: 'roomNumber', label: 'Room / Suite Number', type: 'text', required: true, placeholder: 'Room 504' },
            { id: 'f-c4', name: 'overallRating', label: 'Overall Stay Satisfaction', type: 'rating', required: true, placeholder: '5' },
            { id: 'f-c5', name: 'cleanlinessRating', label: 'Housekeeping & Cleanliness', type: 'rating', required: true, placeholder: '5' },
            { id: 'f-c6', name: 'staffCourtesy', label: 'Front-Desk & Butler Attentiveness', type: 'rating', required: true, placeholder: '5' },
            { id: 'f-c7', name: 'diningSatisfaction', label: 'Dining, In-Room Service & Taste', type: 'rating', required: true, placeholder: '5' },
            { id: 'f-c8', name: 'wouldRecommend', label: 'Would you recommend OmniStay to friends?', type: 'select', required: true, options: ['Definitely Yes (Net Promoter Score 10)', 'Likely (8-9)', 'Neutral (6-7)', 'Unlikely'] },
            { id: 'f-c9', name: 'comments', label: 'Memorable Moments or Areas for Improvement', type: 'textarea', required: false, placeholder: 'Tell us how our team made a difference during your stay...' },
          ],
        },
      },
      {
        tenantId,
        formName: 'VIP Corporate Conference & MICE RSVP (Chapter 11.4)',
        isActive: true,
        formSchema: {
          title: 'Corporate Conference & Executive MICE RSVP',
          description: 'Flawless business summits, board meetings, and global galas.',
          fields: [
            { id: 'f-m1', name: 'fullName', label: 'Event Coordinator / Lead Organizer', type: 'text', required: true, placeholder: 'Director of Corporate Events' },
            { id: 'f-m2', name: 'companyName', label: 'Company / Organization Name', type: 'text', required: true, placeholder: 'Global Tech Enterprises Inc.' },
            { id: 'f-m3', name: 'email', label: 'Official Business Email', type: 'email', required: true, placeholder: 'events@globaltech.com' },
            { id: 'f-m4', name: 'phone', label: 'Direct Mobile / Office Phone', type: 'phone', required: true, placeholder: '+1 (555) 987-6543' },
            { id: 'f-m5', name: 'eventDate', label: 'Target Summit Date', type: 'date', required: true },
            { id: 'f-m6', name: 'headcount', label: 'Delegates / Attendees (PAX)', type: 'number', required: true, placeholder: '180' },
            { id: 'f-m7', name: 'hallLayout', label: 'Auditorium Seating Arrangement', type: 'select', required: true, options: ['Theatre Style Auditorium', 'Classroom Rows with Power Sockets', 'U-Shape Executive Boardroom', 'Cabaret Round Tables'] },
            { id: 'f-m8', name: 'avRequirements', label: 'Audio-Visual Infrastructure Required', type: 'checkbox', required: false, options: ['Dual Ultra-HD 4K LED Walls', 'Wireless Collar & Handheld Microphones', 'Simultaneous Multi-Language Interpretation Booths', 'Ultra-Fast 1Gbps Dedicated Fiber Wi-Fi'] },
            { id: 'f-m9', name: 'budget', label: 'Estimated Corporate Budget', type: 'select', required: true, options: ['$10,000 - $30,000', '$30,000 - $75,000', '$75,000 - $150,000+'] },
            { id: 'f-m10', name: 'notes', label: 'Security, VIP Transit & Executive Notes', type: 'textarea', required: false, placeholder: 'VIP guest escorts, secretarial suites, dietary restrictions...' },
          ],
        },
      },
    ];

    for (const t of defaultTemplates) {
      await this.prisma.formBuilder.create({ data: t });
    }

    return this.prisma.formBuilder.findMany({
      where: { tenantId },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFormById(id: string) {
    return this.prisma.formBuilder.findUnique({
      where: { id },
      include: { responses: true },
    });
  }

  async createResponse(data: {
    formId: string;
    formData: Record<string, any>;
    submitterIp?: string;
  }) {
    return this.prisma.formResponse.create({ data });
  }

  async findResponses(formId: string) {
    return this.prisma.formResponse.findMany({
      where: { formId },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
