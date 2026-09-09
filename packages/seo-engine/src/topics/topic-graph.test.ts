import { describe, expect, it } from 'vitest';
import { InMemoryTopicGraphRepository, TopicGraphService } from './topic-graph.js';

const topic = (tenantId: string, id: string) => ({
  id,
  tenantId,
  name: id,
  slug: id,
  entityType: 'topic',
});

describe('TopicGraphService', () => {
  it('keeps reads and links tenant scoped', async () => {
    const repository = new InMemoryTopicGraphRepository();
    const service = new TopicGraphService(repository);
    await service.createTopic(topic('tenant-a', 'root'));
    await service.createTopic(topic('tenant-b', 'other'));

    expect((await service.listGraph('tenant-a')).topics.map(({ id }) => id)).toEqual(['root']);
    await expect(
      service.linkTopics({
        id: 'cross-tenant',
        tenantId: 'tenant-a',
        sourceTopicId: 'root',
        targetTopicId: 'other',
        relationType: 'related_to',
        weight: 1,
      }),
    ).rejects.toThrow('requested tenant');
  });

  it('traverses a cyclic graph once per topic', async () => {
    const repository = new InMemoryTopicGraphRepository();
    const service = new TopicGraphService(repository);
    for (const id of ['a', 'b', 'c']) await service.createTopic(topic('tenant-a', id));
    const relations = [
      ['a-b', 'a', 'b'],
      ['b-c', 'b', 'c'],
      ['c-a', 'c', 'a'],
    ] as const;
    for (const [id, sourceTopicId, targetTopicId] of relations) {
      await service.linkTopics({
        id,
        tenantId: 'tenant-a',
        sourceTopicId,
        targetTopicId,
        relationType: 'related_to',
        weight: 1,
      });
    }

    expect((await service.listRelated('tenant-a', 'a', 10)).map(({ id }) => id)).toEqual(['b', 'c']);
  });
});
