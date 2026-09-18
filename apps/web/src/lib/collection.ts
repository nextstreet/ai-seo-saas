export type CollectionItem = {
  slug: string;
  name: string;
  type: 'Backpack' | 'Crossbody' | 'Tote';
  color: string;
  swatch: string;
  image: string;
  display: 'Pins' | 'Photocards';
  mood: 'Playful' | 'Soft' | 'Minimal';
  occasion: 'Conventions' | 'Everyday';
  window: 'Heart' | 'Rectangle';
  collectionSize: 'Small' | 'Medium' | 'Large';
  description: string;
  note: string;
  highlights: Array<{ title: string; text: string }>;
  planningPoints: string[];
};

export const collection: CollectionItem[] = [
  {
    slug: 'sweetheart',
    name: 'The Sweetheart',
    type: 'Backpack',
    color: 'Blush pink',
    swatch: '#eaa8bc',
    image: '/images/heart.webp',
    display: 'Pins',
    mood: 'Playful',
    occasion: 'Conventions',
    window: 'Heart',
    collectionSize: 'Large',
    description: 'A heart-shaped frame for the little things you love. Build a playful arrangement of pins, ribbons and keepsakes.',
    note: 'Start with one focal pin, then arrange smaller pieces around it. Leave breathing room along the heart-shaped edge.',
    highlights: [
      { title: 'A shaped focal point', text: 'The heart window gives the display a clear center and makes a dense pin arrangement feel intentional.' },
      { title: 'Made for a full-day carry', text: 'The backpack format is a useful starting point when comfort and a larger collection matter equally.' },
      { title: 'Easy to recolor', text: 'Keep the silhouette and change the fabric, trim and insert palette around a specific character or collection.' },
    ],
    planningPoints: ['Confirm the usable heart-window area', 'Measure the largest pin and attachment', 'Plan total display weight', 'Choose a removable insert color'],
  },
  {
    slug: 'mint-story',
    name: 'Mint Story',
    type: 'Crossbody',
    color: 'Mint green',
    swatch: '#abcbbd',
    image: '/images/mint.webp',
    display: 'Photocards',
    mood: 'Soft',
    occasion: 'Everyday',
    window: 'Rectangle',
    collectionSize: 'Small',
    description: 'Your favorite cards, always in the picture. A fresh mint palette and a clean window make every tiny detail feel special.',
    note: 'Use protective sleeves and an insert that holds the cards in place. Check the usable window dimensions before choosing a layout.',
    highlights: [
      { title: 'A clear visual rhythm', text: 'Three card positions make the composition easy to scan while leaving room for small clips or charms.' },
      { title: 'A compact daily format', text: 'The crossbody shape suits a smaller display and keeps the concept visually light.' },
      { title: 'Soft color direction', text: 'Mint, silver and botanical art create a calm base that can be adapted to other pastel collections.' },
    ],
    planningPoints: ['Measure cards with protective sleeves', 'Confirm internal pocket depth', 'Choose fixed slots or a removable insert', 'Check strap length and adjustment range'],
  },
  {
    slug: 'after-hours',
    name: 'After Hours',
    type: 'Tote',
    color: 'Black',
    swatch: '#25282b',
    image: '/images/noir.webp',
    display: 'Pins',
    mood: 'Minimal',
    occasion: 'Everyday',
    window: 'Rectangle',
    collectionSize: 'Medium',
    description: 'A quieter canvas for a collection with personality. Black fabric and celestial silver details, made for your everyday rotation.',
    note: 'Choose one metal finish and repeat it across the display. A dark insert makes silver details stand out.',
    highlights: [
      { title: 'Contrast does the work', text: 'A dark base lets pale metal, white art and reflective details become the visual focus.' },
      { title: 'A wide display field', text: 'The tote format provides a horizontal composition for medium-size pin collections.' },
      { title: 'Quiet from a distance', text: 'A limited palette keeps the bag versatile while the close-up details still reward attention.' },
    ],
    planningPoints: ['Confirm window width and opening method', 'Choose a rigid or soft insert', 'Balance display weight across the tote', 'Specify hardware finish consistently'],
  },
];

export const browsePaths = [
  { label: 'For enamel pins', value: 'Pins', image: '/images/heart.webp', description: 'Layouts built around pin size, spacing and total display weight.' },
  { label: 'For photocards', value: 'Photocards', image: '/images/mint.webp', description: 'Clean windows and protected arrangements for card collections.' },
  { label: 'For conventions', value: 'Conventions', image: '/images/campaign.webp', description: 'Carry formats considered for longer days and active use.' },
  { label: 'For everyday', value: 'Everyday', image: '/images/noir.webp', description: 'Quieter concepts that fit into a regular wardrobe.' },
];
