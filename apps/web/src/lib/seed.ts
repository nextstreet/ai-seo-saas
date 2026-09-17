import { scoreCandidate } from './gate';
import type { CandidateContent, Design, Entity, GalleryItem, Intent, Material, Product, PublishedContent, Tenant, Topic } from './types';

export const tenant: Tenant = {
  id: 'tenant-ita-lab',
  slug: 'custom-ita-bag',
  name: 'Custom Ita Bag Lab',
  primaryDomain: 'customitabag.example'
};

export const topics: Topic[] = [
  { id: 'topic-hub', tenantId: tenant.id, slug: 'custom-ita-bag', name: 'Custom Ita Bag', summary: 'The commercial hub for custom ita bags, display windows, inserts, and buyer decisions.', searchIntents: ['buy', 'custom', 'compare'], priority: 96 },
  { id: 'topic-backpack', tenantId: tenant.id, parentId: 'topic-hub', slug: 'custom-ita-backpack', name: 'Custom Ita Backpack', summary: 'Backpack formats for pin, plush, and photocard displays.', searchIntents: ['buy', 'design'], priority: 88 },
  { id: 'topic-insert', tenantId: tenant.id, parentId: 'topic-hub', slug: 'ita-bag-insert', name: 'Ita Bag Insert', summary: 'Insert materials, pin security, replacement panels, and decoration planning.', searchIntents: ['how-to', 'material', 'buy'], priority: 84 },
  { id: 'topic-window', tenantId: tenant.id, parentId: 'topic-hub', slug: 'ita-bag-window', name: 'Ita Bag Window', summary: 'Clear window shape, visibility, scratch resistance, and layout design.', searchIntents: ['design', 'compare'], priority: 78 },
  { id: 'topic-material', tenantId: tenant.id, parentId: 'topic-hub', slug: 'ita-bag-materials', name: 'Ita Bag Materials', summary: 'PVC, PU leather, nylon, canvas, and hardware decisions.', searchIntents: ['compare', 'buy'], priority: 74 },
  { id: 'topic-gallery', tenantId: tenant.id, parentId: 'topic-hub', slug: 'ita-bag-design-ideas', name: 'Ita Bag Design Ideas', summary: 'Community-led examples and voting for new product directions.', searchIntents: ['ideas', 'community'], priority: 70 }
];

export const entities: Entity[] = [
  { id: 'entity-backpack', tenantId: tenant.id, slug: 'backpack', name: 'Backpack', entityType: 'product_type', attributes: { capacity: 'medium to high' } },
  { id: 'entity-tote', tenantId: tenant.id, slug: 'tote', name: 'Tote', entityType: 'product_type', attributes: { access: 'open top or zipper' } },
  { id: 'entity-heart-window', tenantId: tenant.id, slug: 'heart-window', name: 'Heart Window', entityType: 'window_shape', attributes: { style: 'cute, idol, anime' } },
  { id: 'entity-star-window', tenantId: tenant.id, slug: 'star-window', name: 'Star Window', entityType: 'window_shape', attributes: { style: 'stage, concert, playful' } },
  { id: 'entity-pins', tenantId: tenant.id, slug: 'enamel-pins', name: 'Enamel Pins', entityType: 'display_object', attributes: { risk: 'pin backing pressure' } },
  { id: 'entity-photocards', tenantId: tenant.id, slug: 'photocards', name: 'Photocards', entityType: 'display_object', attributes: { risk: 'bending and moisture' } },
  { id: 'entity-pu', tenantId: tenant.id, slug: 'pu-leather', name: 'PU Leather', entityType: 'material', attributes: { feel: 'structured and wipeable' } },
  { id: 'entity-pvc', tenantId: tenant.id, slug: 'clear-pvc', name: 'Clear PVC', entityType: 'material', attributes: { use: 'display window' } }
];

export const products: Product[] = [
  { id: 'product-backpack', tenantId: tenant.id, slug: 'custom-ita-backpack', name: 'Custom Ita Backpack', productType: 'backpack', features: ['detachable insert', 'clear display window', 'reinforced straps'], materials: ['PU leather', 'clear PVC', 'polyester lining'], useCases: ['anime conventions', 'idol concerts', 'daily merch display'], status: 'sampled' },
  { id: 'product-tote', tenantId: tenant.id, slug: 'custom-ita-tote-bag', name: 'Custom Ita Tote Bag', productType: 'tote', features: ['large flat display area', 'zipper closure', 'replaceable insert'], materials: ['canvas', 'clear PVC'], useCases: ['artist alley', 'commuting', 'event merchandise'], status: 'planned' },
  { id: 'product-crossbody', tenantId: tenant.id, slug: 'custom-ita-crossbody-bag', name: 'Custom Ita Crossbody Bag', productType: 'crossbody', features: ['compact display window', 'adjustable strap', 'lightweight shell'], materials: ['nylon', 'clear TPU'], useCases: ['concerts', 'theme parks', 'casual display'], status: 'planned' }
];

export const designs: Design[] = [
  { id: 'design-heart', tenantId: tenant.id, slug: 'heart-window-ita-bag', name: 'Heart Window Ita Bag', aesthetic: 'cute idol display', displayObjects: ['enamel pins', 'badges', 'photocards'], colorways: ['pink', 'black', 'lavender'] },
  { id: 'design-minimal', tenantId: tenant.id, slug: 'minimal-ita-bag', name: 'Minimal Ita Bag', aesthetic: 'clean daily carry', displayObjects: ['photocards', 'keychains'], colorways: ['black', 'ivory', 'sage'] },
  { id: 'design-plush', tenantId: tenant.id, slug: 'plush-display-ita-bag', name: 'Plush Display Ita Bag', aesthetic: 'soft toy showcase', displayObjects: ['plushies', 'keychains'], colorways: ['cream', 'sky blue', 'charcoal'] }
];

export const materials: Material[] = [
  { id: 'material-pu', tenantId: tenant.id, slug: 'pu-leather', name: 'PU Leather', properties: ['structured handfeel', 'easy surface cleaning', 'good color range'], buyerNotes: 'Good for polished commercial styles where shape retention matters.' },
  { id: 'material-pvc', tenantId: tenant.id, slug: 'clear-pvc', name: 'Clear PVC', properties: ['display visibility', 'flexibility', 'scratch sensitivity'], buyerNotes: 'Best evaluated with sample lighting, print color, and expected display objects.' },
  { id: 'material-canvas', tenantId: tenant.id, slug: 'canvas', name: 'Canvas', properties: ['casual texture', 'lower shine', 'print friendly'], buyerNotes: 'Useful for artist-led designs and softer daily carry positioning.' }
];

export const intents: Intent[] = [
  { id: 'intent-buy', tenantId: tenant.id, slug: 'buy', name: 'Buy / Source', stage: 'buy', requiredEvidence: ['MOQ', 'sample path', 'material options', 'lead time questions'], pageFit: ['product', 'comparison'] },
  { id: 'intent-design', tenantId: tenant.id, slug: 'design', name: 'Design Ideas', stage: 'design', requiredEvidence: ['display object examples', 'layout rules', 'gallery assets'], pageFit: ['design_inspiration', 'gallery'] },
  { id: 'intent-material', tenantId: tenant.id, slug: 'material', name: 'Material Decision', stage: 'compare', requiredEvidence: ['material properties', 'care notes', 'trade-offs'], pageFit: ['material_guide', 'comparison'] },
  { id: 'intent-how-to', tenantId: tenant.id, slug: 'how-to', name: 'How To Use', stage: 'post_purchase', requiredEvidence: ['steps', 'tools', 'risk prevention'], pageFit: ['intent_guide'] }
];

const pageBlueprints = [
  ['custom-ita-bag', 'product', 'custom ita bag', 'Custom Ita Bag Manufacturer for Merch Displays', 'Plan custom ita bags with window, insert, material, and merch display options for anime, idol, and artist merchandise buyers.', 'Buyers need a commercial page that separates bag format, display protection, sample decisions, and branding options.'],
  ['custom-ita-backpack', 'product', 'custom ita backpack', 'Custom Ita Backpack for Pins and Photocards', 'Compare custom ita backpack structures, insert options, and display windows for enamel pins, photocards, and convention carry.', 'Backpack buyers need capacity, strap, insert, and window choices in one decision page.'],
  ['ita-bag-insert-guide', 'intent_guide', 'ita bag insert', 'Ita Bag Insert Guide for Secure Pin Layouts', 'Choose ita bag insert materials, pin spacing, backing protection, and replacement panel options for safer merch display.', 'Users want practical steps and material trade-offs, not a generic product pitch.'],
  ['heart-window-ita-bag', 'design_inspiration', 'heart window ita bag', 'Heart Window Ita Bag Design Ideas', 'Explore heart window ita bag layouts for pins, badges, photocards, and idol merchandise with buyer-focused production notes.', 'This design deserves a standalone page when examples and voting data show demand.'],
  ['ita-bag-materials', 'material_guide', 'ita bag materials', 'Ita Bag Materials: PU Leather, PVC, Canvas, Nylon', 'Compare ita bag materials for structure, cleaning, display clarity, and merch protection before sampling custom designs.', 'Material intent needs trade-offs that a product hub cannot answer deeply enough.'],
  ['custom-ita-tote-bag', 'product', 'custom ita tote bag', 'Custom Ita Tote Bag for Artist and Event Merch', 'Plan custom ita tote bags with large display panels, inserts, closures, and brandable material choices for event merchandise.', 'Tote intent differs from backpack because display area and daily-carry posture change.'],
  ['ita-bag-design-ideas', 'gallery', 'ita bag design ideas', 'Ita Bag Design Ideas Voted by Collectors', 'Browse ita bag design ideas shaped by community voting, display object needs, and practical custom production decisions.', 'Gallery pages should become demand sensors for product development.'],
  ['ita-bag-for-enamel-pins', 'intent_guide', 'ita bag for enamel pins', 'Ita Bag for Enamel Pins: Layout and Insert Tips', 'Design an ita bag for enamel pins with better spacing, backing pressure control, and display-window protection.', 'Pin-heavy bags require distinct insert and security guidance.'],
  ['ita-bag-for-photocards', 'intent_guide', 'ita bag for photocards', 'Ita Bag for Photocards: Display and Protection Guide', 'Choose ita bag layouts for photocards with sleeve clearance, bending protection, and window visibility in mind.', 'Photocard intent is visually and materially different from pin display.'],
  ['custom-ita-bag-manufacturer', 'product', 'custom ita bag manufacturer', 'Custom Ita Bag Manufacturer for Brand Programs', 'Work with a custom ita bag manufacturer on samples, material options, display windows, and scalable merch production.', 'Commercial sourcing pages need vendor evaluation and sample-stage questions.'],
  ['ita-backpack-vs-ita-tote', 'comparison', 'ita backpack vs ita tote', 'Ita Backpack vs Ita Tote: Which Custom Bag Fits?', 'Compare ita backpacks and ita totes for display area, carry comfort, event use, and custom manufacturing decisions.', 'Comparison intent should not be buried inside either product page.'],
  ['clear-window-ita-bag', 'material_guide', 'clear window ita bag', 'Clear Window Ita Bag Buying Guide', 'Evaluate clear window ita bag materials, shapes, visibility, and scratch-risk trade-offs before choosing a custom sample.', 'Window clarity and durability create a separate decision path.']
] as const;

const variants = ['pink', 'black', 'mini', 'large'];

const rawCandidates = [
  ...pageBlueprints.map((item, index) => ({
    id: `candidate-${index + 1}`,
    topic: topics[index % topics.length],
    slug: item[0],
    pageType: item[1],
    primaryKeyword: item[2],
    title: item[3],
    metaDescription: item[4],
    intentSummary: item[5],
    searchDemand: 70 + (index % 5) * 6,
    commercialValue: 5 + (index % 4),
    originalAssets: 3 + (index % 3),
    existingCoverage: index % 3,
    outline: ['Intent match', 'Buyer decision criteria', 'Material or design options', 'Production questions', 'Internal links']
  })),
  ...pageBlueprints.flatMap((item, index) =>
    variants.map((variant, variantIndex) => ({
      id: `candidate-${item[0]}-${variant}`,
      topic: topics[(index + variantIndex) % topics.length],
      slug: `${variant}-${item[0]}`,
      pageType: item[1],
      primaryKeyword: `${variant} ${item[2]}`,
      title: `${variant[0].toUpperCase()}${variant.slice(1)} ${item[3]}`.slice(0, 64),
      metaDescription: `Evaluate ${variant} ${item[2]} ideas with intent-specific design, material, display, and custom production notes for buyers.`.slice(0, 155),
      intentSummary: `${variant} demand is tracked as a candidate page and should publish only when examples or product assets prove standalone value.`,
      searchDemand: 48 + variantIndex * 7 + (index % 4) * 4,
      commercialValue: 3 + variantIndex,
      originalAssets: 1 + variantIndex,
      existingCoverage: variantIndex < 2 ? 2 : 1,
      outline: ['Search intent', 'Design difference', 'Display examples', 'Buyer fit', 'Publish decision']
    }))
  )
];

export const candidates: CandidateContent[] = rawCandidates.map((item) =>
  scoreCandidate({
    ...item,
    tenantId: tenant.id
  })
);

export const publishedContents: PublishedContent[] = candidates
  .filter((candidate) => candidate.status === 'approved')
  .slice(0, 52)
  .map((candidate, index) => ({
    id: `published-${index + 1}`,
    tenantId: tenant.id,
    candidateId: candidate.id,
    slug: candidate.slug,
    pageType: candidate.pageType,
    primaryKeyword: candidate.primaryKeyword,
    title: candidate.title,
    metaDescription: candidate.metaDescription,
    heroSummary: candidate.intentSummary,
    body: [
      {
        heading: 'Search Intent Fit',
        paragraphs: [
          `${candidate.primaryKeyword} deserves a focused page when the visitor needs a specific buying, design, material, or comparison answer. This page is built around that intent instead of swapping only a color or shape keyword.`,
          'For V1, every page keeps the buyer decision visible: what the bag must display, how it will be carried, which materials change the result, and what a sample should prove before a bulk order.'
        ]
      },
      {
        heading: 'Configuration Decisions',
        paragraphs: [
          'The practical decisions usually start with bag format, display window size, insert stiffness, material handfeel, zipper or closure style, and the objects that need to be protected.',
          'A custom program should separate confirmed sample details from configurable options so the page can rank while staying accurate as products evolve.'
        ],
        bullets: ['Display object: pins, badges, photocards, plushies, or keychains', 'Window decision: shape, clarity, thickness, and scratch tolerance', 'Insert decision: replaceable panel, pin backing pressure, and layout spacing']
      },
      {
        heading: 'What To Validate Before Publishing More Variants',
        paragraphs: [
          'Variant pages should be expanded only when they bring new examples, a distinct audience need, or measurable demand from search, social, or community voting.',
          'If a candidate does not pass the gate, it should become a section inside a stronger hub instead of becoming a thin standalone page.'
        ]
      }
    ],
    internalLinks: [
      { label: 'Custom Ita Bag', slug: 'custom-ita-bag' },
      { label: 'Ita Bag Design Ideas', slug: 'ita-bag-design-ideas' },
      { label: 'Ita Bag Materials', slug: 'ita-bag-materials' }
    ].filter((link) => link.slug !== candidate.slug),
    publishedAt: '2026-09-04'
  }));

export const galleryItems: GalleryItem[] = [
  { id: 'gallery-heart-pink', tenantId: tenant.id, slug: 'sweetheart', title: 'Pink Heart Window Backpack', imageUrl: 'https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?auto=format&fit=crop&w=900&q=80', description: 'A cute idol-style direction for enamel pins and badges.', tags: ['heart window', 'pink', 'pins'], votesCount: 42 },
  { id: 'gallery-minimal-black', tenantId: tenant.id, slug: 'after-hours', title: 'Minimal Black Daily Carry', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80', description: 'A quieter style for daily use and subtle photocard display.', tags: ['black', 'minimal', 'photocards'], votesCount: 31 },
  { id: 'gallery-plush-blue', tenantId: tenant.id, slug: 'mint-story', title: 'Soft Blue Plush Display', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', description: 'A wider window concept for small plushies and charms.', tags: ['plush', 'blue', 'charms'], votesCount: 27 }
];
