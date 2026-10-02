import { describe, expect, it } from 'vitest';
import { normalizeCmsBlock } from './cms-blocks.js';

describe('normalizeCmsBlock', () => {
  it('maps each valid Directus row to its typed block', () => {
    expect(normalizeCmsBlock({ id: 'b1', block_type: 'heading', heading: 'Section' }, 'b1')).toEqual({
      blockType: 'heading',
      heading: 'Section',
    });

    expect(normalizeCmsBlock({ id: 'b2', block_type: 'text', body: '<p>Hi</p>' }, 'b2')).toEqual({
      blockType: 'text',
      body: '<p>Hi</p>',
    });

    expect(
      normalizeCmsBlock(
        { id: 'b3', block_type: 'options', items: [{ label: 'Shape', detail: 'Heart window' }] },
        'b3',
      ),
    ).toEqual({
      blockType: 'options',
      items: [{ label: 'Shape', detail: 'Heart window' }],
    });

    expect(
      normalizeCmsBlock(
        { id: 'b4', block_type: 'steps', items: [{ name: 'Plan', text: 'Collect first' }] },
        'b4',
      ),
    ).toEqual({
      blockType: 'steps',
      items: [{ name: 'Plan', text: 'Collect first' }],
    });

    expect(
      normalizeCmsBlock(
        { id: 'b5', block_type: 'faq', items: [{ question: 'Why?', answer: 'Because.' }] },
        'b5',
      ),
    ).toEqual({
      blockType: 'faq',
      items: [{ question: 'Why?', answer: 'Because.' }],
    });

    expect(
      normalizeCmsBlock(
        {
          id: 'b6',
          block_type: 'comparison',
          heading: 'Two formats',
          items: [{ dimension: 'Capacity', difference: 'Backpack holds more' }],
        },
        'b6',
      ),
    ).toEqual({
      blockType: 'comparison',
      heading: 'Two formats',
      items: [{ dimension: 'Capacity', difference: 'Backpack holds more' }],
    });

    expect(
      normalizeCmsBlock(
        {
          id: 'b7',
          block_type: 'cta',
          heading: 'Ready?',
          body: '<p>Start now</p>',
          cta_label: 'Contact',
          cta_url: '/contact/',
        },
        'b7',
      ),
    ).toEqual({
      blockType: 'cta',
      heading: 'Ready?',
      body: '<p>Start now</p>',
      ctaLabel: 'Contact',
      ctaUrl: '/contact/',
    });
  });

  it('rejects rows with an unknown or missing block type', () => {
    expect(() => normalizeCmsBlock({ block_type: 'mystery' }, 'x1')).toThrow(/x1/);
    expect(() => normalizeCmsBlock({ heading: 'No type' }, 'x2')).toThrow(/validation/);
    expect(() => normalizeCmsBlock('not-an-object', 'x3')).toThrow(/not an object/);
    expect(() => normalizeCmsBlock(null, 'x4')).toThrow(/not an object/);
  });

  it('rejects rows whose required fields are missing or empty', () => {
    expect(() => normalizeCmsBlock({ block_type: 'heading' }, 'y1')).toThrow(/heading/);
    expect(() =>
      normalizeCmsBlock({ block_type: 'steps', items: [] }, 'y2'),
    ).toThrow(/items/);
    expect(() =>
      normalizeCmsBlock({ block_type: 'faq', items: [{ question: 'Q only' }] }, 'y3'),
    ).toThrow(/answer/);
    expect(() =>
      normalizeCmsBlock(
        { block_type: 'cta', cta_label: 'Go', cta_url: '' },
        'y4',
      ),
    ).toThrow(/ctaUrl/);
    expect(() =>
      normalizeCmsBlock(
        { block_type: 'cta', cta_label: 'Go', cta_url: 'javascript:alert(1)' },
        'y5',
      ),
    ).toThrow(/ctaUrl/);
  });
});
