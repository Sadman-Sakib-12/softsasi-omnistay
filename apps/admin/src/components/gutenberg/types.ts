export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'list'
  | 'quote'
  | 'code'
  | 'table'
  | 'columns'
  | 'button'
  | 'separator'
  | 'spacer'
  | 'feature-cards'
  | 'testimonial';

export interface GutenbergBlock {
  id: string;
  type: BlockType;
  content?: string;
  level?: 1 | 2 | 3 | 4;
  align?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  textColor?: string;
  backgroundColor?: string;
  url?: string;
  alt?: string;
  caption?: string;
  items?: string[];
  listType?: 'unordered' | 'ordered';
  citation?: string;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  images?: Array<{ url: string; caption?: string }>;
  columnsCount?: number;
  columns?: Array<{ id: string; content: string }>;
  headers?: string[];
  rows?: string[][];
  spacerHeight?: number;
  rating?: number;
}

export interface GutenbergBlockMeta {
  type: BlockType;
  label: string;
  category: 'text' | 'media' | 'design' | 'widgets';
  description: string;
  iconName: string;
}

export const BLOCK_METAS: GutenbergBlockMeta[] = [
  // Text
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'text',
    description: 'Start with the basic building block of all narrative.',
    iconName: 'Pilcrow',
  },
  {
    type: 'heading',
    label: 'Heading',
    category: 'text',
    description: 'Introduce new sections and organize content hierarchy.',
    iconName: 'Heading',
  },
  {
    type: 'list',
    label: 'List',
    category: 'text',
    description: 'Create a bulleted or numbered itemized list.',
    iconName: 'List',
  },
  {
    type: 'quote',
    label: 'Quote',
    category: 'text',
    description: 'Give quoted text visual emphasis and citation.',
    iconName: 'Quote',
  },
  {
    type: 'code',
    label: 'Code',
    category: 'text',
    description: 'Display code snippets that respect spacing and tabs.',
    iconName: 'Code',
  },
  {
    type: 'table',
    label: 'Table',
    category: 'text',
    description: 'Insert structured tabular data, pricing, or schedules.',
    iconName: 'Table',
  },

  // Media
  {
    type: 'image',
    label: 'Image',
    category: 'media',
    description: 'Insert a single photo, graphic, or banner with caption.',
    iconName: 'ImageIcon',
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    description: 'Display multiple images in a rich photo grid.',
    iconName: 'Grid',
  },

  // Design & Layout
  {
    type: 'columns',
    label: 'Columns',
    category: 'design',
    description: 'Add a multi-column block for flexible side-by-side layouts.',
    iconName: 'Columns3',
  },
  {
    type: 'button',
    label: 'Button',
    category: 'design',
    description: 'Prompt visitors to take action with a customized CTA button.',
    iconName: 'MousePointerClick',
  },
  {
    type: 'separator',
    label: 'Separator',
    category: 'design',
    description: 'Create a break between ideas or sections with a horizontal line.',
    iconName: 'Minus',
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'design',
    description: 'Add customized vertical white space between blocks.',
    iconName: 'MoveVertical',
  },

  // Widgets
  {
    type: 'feature-cards',
    label: 'Feature Cards',
    category: 'widgets',
    description: '3-card highlight banner matching OmniStay homepage portal.',
    iconName: 'Sparkles',
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    category: 'widgets',
    description: 'Guest review with 5-star rating, review quote, and author name.',
    iconName: 'Star',
  },
];

export function createEmptyBlock(type: BlockType): GutenbergBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  switch (type) {
    case 'heading':
      return { id, type, content: '', level: 2, align: 'left' };
    case 'image':
      return {
        id,
        type,
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        alt: 'OmniStay Luxury Property',
        caption: 'Luxury oceanfront suite with panoramic coastal views.',
        align: 'center',
      };
    case 'gallery':
      return {
        id,
        type,
        images: [
          { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80', caption: 'Deluxe Suite' },
          { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', caption: 'Private Beach' },
          { url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80', caption: 'Infinity Pool' },
        ],
      };
    case 'list':
      return {
        id,
        type,
        items: ['24/7 Dedicated Concierge & Valet', 'Complimentary High-Speed Wi-Fi 6', 'Organic Gourmet Breakfast Included'],
        listType: 'unordered',
      };
    case 'quote':
      return {
        id,
        type,
        content: 'Hospitality is simply an opportunity to show love and care to our guests.',
        citation: 'OmniStay Guest Experience Team',
      };
    case 'code':
      return {
        id,
        type,
        content: `GET /api/v1/properties/availabilities?checkIn=2026-11-15&checkOut=2026-11-20\nHost: api.omnistay.com\nAuthorization: Bearer <token>`,
      };
    case 'table':
      return {
        id,
        type,
        headers: ['Vertical', 'Duration', 'Base Rate', 'Inclusions'],
        rows: [
          ['Executive Penthouse', 'Nightly', '$450/night', 'Airport Limo, Butler, Breakfast'],
          ['Private Yacht Charter', '4 Hours', '$1,200', 'Skipper, Champagne, Snorkeling'],
          ['Coworking Hot Desk', 'Day Pass', '$35/day', 'Fiber Wi-Fi, Meeting Room 1hr'],
        ],
      };
    case 'columns':
      return {
        id,
        type,
        columnsCount: 2,
        columns: [
          {
            id: `${id}-c1`,
            content: '### Exclusive Villa Perks\nEnjoy full private access to infinity pool, master chef dining, and bespoke excursions arranged by your personal butler.',
          },
          {
            id: `${id}-c2`,
            content: '### Flexible Check-In / Out\nEarly 10:00 AM check-in and complimentary late 3:00 PM check-out guaranteed for all verified direct bookings.',
          },
        ],
      };
    case 'button':
      return {
        id,
        type,
        buttonText: 'Book Your Stay Now',
        url: '/stays',
        buttonVariant: 'primary',
        align: 'left',
      };
    case 'separator':
      return { id, type };
    case 'spacer':
      return { id, type, spacerHeight: 32 };
    case 'feature-cards':
      return {
        id,
        type,
        content: 'Special Offers, Newsletters, Travel Tips highlight row',
      };
    case 'testimonial':
      return {
        id,
        type,
        content: 'Our weekend stay was completely transformative. The attention to detail, spotless villas, and effortless digital key check-in were world-class.',
        citation: 'Sophia Laurent · Travel & Leisure Magazine',
        rating: 5,
      };
    case 'paragraph':
    default:
      return {
        id,
        type: 'paragraph',
        content: '',
        align: 'left',
        fontSize: 'base',
      };
  }
}

/**
 * Converts stored Markdown/string into an array of Gutenberg blocks
 */
export function parseContentToBlocks(raw: string | undefined): GutenbergBlock[] {
  if (!raw || !raw.trim()) {
    return [
      {
        id: 'block-init',
        type: 'paragraph',
        content: '',
        align: 'left',
        fontSize: 'base',
      },
    ];
  }

  // Check if saved as JSON payload
  if (raw.trim().startsWith('[') && raw.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
        return parsed;
      }
    } catch {
      // fallback to markdown parsing
    }
  }

  // Check if saved with Gutenberg JSON comment wrapper
  const jsonMatch = raw.match(/<!-- omnistay-blocks: ([\s\S]*?) -->/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // fallback to markdown parsing
    }
  }

  // Parse Markdown sections into blocks
  const lines = raw.split('\n');
  const blocks: GutenbergBlock[] = [];
  let currentParagraph = '';
  let currentListItems: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'paragraph',
        content: currentParagraph.trim(),
        align: 'left',
      });
      currentParagraph = '';
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'list',
        items: [...currentListItems],
        listType: 'unordered',
      });
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      currentListItems.push(trimmed.substring(2));
      continue;
    } else {
      flushList();
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'heading',
        level: 1,
        content: trimmed.substring(2),
      });
    } else if (trimmed.startsWith('## ')) {
      flushParagraph();
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'heading',
        level: 2,
        content: trimmed.substring(3),
      });
    } else if (trimmed.startsWith('### ')) {
      flushParagraph();
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'heading',
        level: 3,
        content: trimmed.substring(4),
      });
    } else if (trimmed.startsWith('> ')) {
      flushParagraph();
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'quote',
        content: trimmed.substring(2),
        citation: 'OmniStay Guide',
      });
    } else if (trimmed.startsWith('---')) {
      flushParagraph();
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: 'separator',
      });
    } else if (trimmed.startsWith('![') && trimmed.includes('](')) {
      flushParagraph();
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        blocks.push({
          id: `block-${blocks.length + 1}`,
          type: 'image',
          alt: match[1] || 'Image',
          url: match[2] || '',
          caption: '',
          align: 'center',
        });
      }
    } else {
      if (currentParagraph) {
        currentParagraph += ' ' + trimmed;
      } else {
        currentParagraph = trimmed;
      }
    }
  }

  flushParagraph();
  flushList();

  return blocks.length > 0
    ? blocks
    : [
        {
          id: 'block-init',
          type: 'paragraph',
          content: '',
          align: 'left',
          fontSize: 'base',
        },
      ];
}

/**
 * Serializes Gutenberg blocks into Markdown for frontend rendering,
 * while attaching the structured block state in a comment for zero-loss roundtrip.
 */
export function serializeBlocksToContent(blocks: GutenbergBlock[]): string {
  const mdParts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const hashes = '#'.repeat(block.level || 2);
        mdParts.push(`${hashes} ${block.content || ''}`);
        break;
      }
      case 'paragraph': {
        if (block.content) {
          mdParts.push(block.content);
        }
        break;
      }
      case 'image': {
        if (block.url) {
          mdParts.push(`![${block.alt || 'Image'}](${block.url})`);
          if (block.caption) {
            mdParts.push(`*${block.caption}*`);
          }
        }
        break;
      }
      case 'gallery': {
        if (block.images && block.images.length > 0) {
          const imgs = block.images.map((img) => `![${img.caption || 'Gallery Image'}](${img.url})`).join('\n\n');
          mdParts.push(imgs);
        }
        break;
      }
      case 'list': {
        if (block.items && block.items.length > 0) {
          const itemsStr = block.items
            .map((item, idx) => (block.listType === 'ordered' ? `${idx + 1}. ${item}` : `- ${item}`))
            .join('\n');
          mdParts.push(itemsStr);
        }
        break;
      }
      case 'quote': {
        mdParts.push(`> ${block.content || ''}${block.citation ? `\n> — *${block.citation}*` : ''}`);
        break;
      }
      case 'code': {
        mdParts.push(`\`\`\`\n${block.content || ''}\n\`\`\``);
        break;
      }
      case 'button': {
        mdParts.push(`**[${block.buttonText || 'Learn More'}](${block.url || '#'})**`);
        break;
      }
      case 'separator': {
        mdParts.push('---');
        break;
      }
      case 'spacer': {
        mdParts.push('\n');
        break;
      }
      case 'testimonial': {
        mdParts.push(`> ⭐⭐⭐⭐⭐ "${block.content || ''}"\n> — **${block.citation || 'Verified Guest'}**`);
        break;
      }
      case 'feature-cards': {
        mdParts.push(
          `### Featured OmniStay Highlights\n- **Special Offers**: Exclusive seasonal savings on luxury villas\n- **Newsletters**: Curated travel tips & member rewards\n- **Travel Tips**: Local insider guides across 45+ destinations`
        );
        break;
      }
      case 'columns': {
        if (block.columns && block.columns.length > 0) {
          mdParts.push(block.columns.map((col) => col.content).join('\n\n---\n\n'));
        }
        break;
      }
      case 'table': {
        if (block.headers && block.rows) {
          const headerRow = `| ${block.headers.join(' | ')} |`;
          const sepRow = `| ${block.headers.map(() => '---').join(' | ')} |`;
          const dataRows = block.rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
          mdParts.push(`${headerRow}\n${sepRow}\n${dataRows}`);
        }
        break;
      }
      default:
        if (block.content) {
          mdParts.push(block.content);
        }
    }
  }

  const markdownBody = mdParts.join('\n\n');
  const metadataComment = `<!-- omnistay-blocks: ${JSON.stringify(blocks)} -->`;

  return `${markdownBody}\n\n${metadataComment}`;
}

