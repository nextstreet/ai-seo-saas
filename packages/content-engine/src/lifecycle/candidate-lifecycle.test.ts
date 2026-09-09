import { describe, expect, it } from 'vitest';
import { transitionCandidate } from './candidate-lifecycle.js';

const candidate = {
  id: 'candidate-1',
  tenantId: 'tenant-1',
  status: 'candidate' as const,
  reason: 'Strong topic fit.',
};

describe('transitionCandidate', () => {
  it('allows the reviewed path and preserves an explainable transition', () => {
    const approved = transitionCandidate(candidate, 'approved', 'Editor approved the brief.');
    const draft = transitionCandidate(approved.candidate, 'draft', 'Draft created from approved facts.');
    const review = transitionCandidate(draft.candidate, 'review', 'Draft is ready for human review.');
    const published = transitionCandidate(review.candidate, 'published', 'Editor signed off.');

    expect(published.candidate.status).toBe('published');
    expect(published.transition.fromStatus).toBe('review');
    expect(published.transition.reason).toBe('Editor signed off.');
  });

  it('never skips review on the way to publication', () => {
    expect(() => transitionCandidate(candidate, 'published', 'Skip ahead.')).toThrow(
      'candidate -> published',
    );
  });

  it('requires a visible reason', () => {
    expect(() => transitionCandidate(candidate, 'approved', '  ')).toThrow('reason is required');
  });
});
