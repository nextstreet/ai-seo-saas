export const workflowReservations = [
  {
    name: 'candidate-topic-expansion',
    trigger: 'manual or n8n schedule',
    input: ['tenant', 'topic cluster', 'Search Console query data', 'social trend URL'],
    output: ['candidate_contents', 'quality_gate']
  },
  {
    name: 'community-signal-ingest',
    trigger: 'gallery vote or forum activity',
    input: ['gallery_item', 'vote count', 'comments', 'tags'],
    output: ['entity weight updates', 'candidate refresh queue']
  },
  {
    name: 'published-content-refresh',
    trigger: 'ranking drop, stale content, new product sample',
    input: ['published_content', 'query metrics', 'product facts'],
    output: ['refresh brief', 'human review task']
  }
];
