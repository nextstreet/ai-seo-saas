import type { Topic, TopicRelation } from '@ai-seo/shared';

export interface TopicGraphRepository {
  saveTopic(topic: Topic): Promise<void>;
  findTopic(tenantId: string, topicId: string): Promise<Topic | undefined>;
  listTopics(tenantId: string): Promise<Topic[]>;
  saveRelation(relation: TopicRelation): Promise<void>;
  listRelations(tenantId: string): Promise<TopicRelation[]>;
}

export interface TopicGraph {
  topics: Topic[];
  relations: TopicRelation[];
}

export class InMemoryTopicGraphRepository implements TopicGraphRepository {
  readonly #topics = new Map<string, Topic>();
  readonly #relations = new Map<string, TopicRelation>();

  async saveTopic(topic: Topic): Promise<void> {
    this.#topics.set(this.#key(topic.tenantId, topic.id), structuredClone(topic));
  }

  async findTopic(tenantId: string, topicId: string): Promise<Topic | undefined> {
    const topic = this.#topics.get(this.#key(tenantId, topicId));
    return topic ? structuredClone(topic) : undefined;
  }

  async listTopics(tenantId: string): Promise<Topic[]> {
    return [...this.#topics.values()]
      .filter((topic) => topic.tenantId === tenantId)
      .map((topic) => structuredClone(topic));
  }

  async saveRelation(relation: TopicRelation): Promise<void> {
    this.#relations.set(this.#key(relation.tenantId, relation.id), structuredClone(relation));
  }

  async listRelations(tenantId: string): Promise<TopicRelation[]> {
    return [...this.#relations.values()]
      .filter((relation) => relation.tenantId === tenantId)
      .map((relation) => structuredClone(relation));
  }

  #key(tenantId: string, id: string): string {
    return `${tenantId}:${id}`;
  }
}

export class TopicGraphService {
  constructor(private readonly repository: TopicGraphRepository) {}

  async createTopic(topic: Topic): Promise<Topic> {
    const duplicate = (await this.repository.listTopics(topic.tenantId)).find(
      (existing) => existing.slug === topic.slug && existing.id !== topic.id,
    );
    if (duplicate) throw new Error(`Topic slug already exists for tenant: ${topic.slug}`);
    await this.repository.saveTopic(topic);
    return topic;
  }

  async linkTopics(relation: TopicRelation): Promise<TopicRelation> {
    if (relation.sourceTopicId === relation.targetTopicId) {
      throw new Error('A topic cannot link to itself.');
    }

    const [source, target] = await Promise.all([
      this.repository.findTopic(relation.tenantId, relation.sourceTopicId),
      this.repository.findTopic(relation.tenantId, relation.targetTopicId),
    ]);
    if (!source || !target) {
      throw new Error('Both relation endpoints must belong to the requested tenant.');
    }

    await this.repository.saveRelation(relation);
    return relation;
  }

  async listGraph(tenantId: string): Promise<TopicGraph> {
    const [topics, relations] = await Promise.all([
      this.repository.listTopics(tenantId),
      this.repository.listRelations(tenantId),
    ]);
    return { topics, relations };
  }

  async listRelated(tenantId: string, rootTopicId: string, maxDepth = 3): Promise<Topic[]> {
    if (!Number.isInteger(maxDepth) || maxDepth < 0) {
      throw new Error('maxDepth must be a non-negative integer.');
    }
    if (!(await this.repository.findTopic(tenantId, rootTopicId))) return [];

    const graph = await this.listGraph(tenantId);
    const topicById = new Map(graph.topics.map((topic) => [topic.id, topic]));
    const visited = new Set([rootTopicId]);
    let frontier = [rootTopicId];

    for (let depth = 0; depth < maxDepth && frontier.length > 0; depth += 1) {
      const next: string[] = [];
      for (const relation of graph.relations) {
        if (frontier.includes(relation.sourceTopicId) && !visited.has(relation.targetTopicId)) {
          visited.add(relation.targetTopicId);
          next.push(relation.targetTopicId);
        }
      }
      frontier = next;
    }

    visited.delete(rootTopicId);
    return [...visited].flatMap((id) => {
      const topic = topicById.get(id);
      return topic ? [topic] : [];
    });
  }
}
