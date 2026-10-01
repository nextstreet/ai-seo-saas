import { describe, expect, it } from 'vitest';
import { mapDirectusProduct } from './directus-cms';

describe('Directus CMS mapper', () => {
  it('maps product facts and localized editorial fields separately', () => {
    const product = {
      product_type: 'Tote', color: 'Black', swatch: '#111111', image_url: '/bag.webp',
      display_type: 'Pins', mood: 'Minimal', occasion: 'Everyday', window_shape: 'Rectangle', collection_size: 'Medium',
    };
    const translation = {
      slug: 'after-hours', name: 'After Hours', description: 'Localized copy', note: 'Localized note',
      highlights: [{ title: 'Contrast', text: 'Dark base.' }], planning_points: ['Confirm dimensions'],
    };

    expect(mapDirectusProduct(product, translation)).toMatchObject({
      slug: 'after-hours', name: 'After Hours', type: 'Tote', description: 'Localized copy',
    });
  });

  it('rejects products without a localized slug and name', () => {
    expect(mapDirectusProduct({}, {})).toBeNull();
  });
});

