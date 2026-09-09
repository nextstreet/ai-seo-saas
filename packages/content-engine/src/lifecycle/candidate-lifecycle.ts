import type { CandidateStatus } from '@ai-seo/shared';

export interface CandidateLifecycleRecord {
  id: string;
  tenantId: string;
  status: CandidateStatus;
  reason: string;
}

export interface CandidateTransition {
  candidateId: string;
  tenantId: string;
  fromStatus: CandidateStatus;
  toStatus: CandidateStatus;
  reason: string;
}

const allowedTransitions: Readonly<Record<CandidateStatus, readonly CandidateStatus[]>> = {
  idea: ['candidate', 'archived'],
  candidate: ['approved', 'archived'],
  approved: ['draft', 'archived'],
  draft: ['review', 'archived'],
  review: ['draft', 'published', 'archived'],
  published: ['refresh', 'archived'],
  refresh: ['draft', 'archived'],
  archived: [],
};

export function canTransitionCandidate(
  fromStatus: CandidateStatus,
  toStatus: CandidateStatus,
): boolean {
  return allowedTransitions[fromStatus].includes(toStatus);
}

export function transitionCandidate(
  candidate: CandidateLifecycleRecord,
  toStatus: CandidateStatus,
  reason: string,
): { candidate: CandidateLifecycleRecord; transition: CandidateTransition } {
  const normalizedReason = reason.trim();
  if (!normalizedReason) throw new Error('A transition reason is required.');
  if (!canTransitionCandidate(candidate.status, toStatus)) {
    throw new Error(`Invalid candidate transition: ${candidate.status} -> ${toStatus}.`);
  }

  const transition = {
    candidateId: candidate.id,
    tenantId: candidate.tenantId,
    fromStatus: candidate.status,
    toStatus,
    reason: normalizedReason,
  } satisfies CandidateTransition;

  return {
    candidate: { ...candidate, status: toStatus, reason: normalizedReason },
    transition,
  };
}
