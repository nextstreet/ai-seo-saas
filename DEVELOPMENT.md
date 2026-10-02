# AI SEO SaaS — Development Guide

## 1. 项目定位

本项目是一套面向独立站、外贸企业和中小制造商的多租户 AI SEO 系统。
第一验证租户是 Custom Ita Bag（痛包定制），业务类型为
`design_driven_custom`。

V1 要验证的是 AI 能否降低研究、规划、扩展和维护高质量 SEO 内容体系的
成本，同时更快获得真实搜索数据与有效询盘。它不是自动文章工厂，也不是
为了展示 Agent 数量而建设的技术 Demo。

核心闭环：

```text
Company/Product Facts
        ↓
Topic & Entity Graph -> Candidate Opportunity -> Content Brief
        ↑                                          ↓
Feedback <- GSC / Social / Votes <- Reviewed Published Page
```

AI 位于决策中心，负责聚类、意图判断、页面类型选择、机会评分、内容缺口、
蚕食风险、Brief、内链和更新建议。发布仍是一个独立、可审核的流程。

## 2. V1 目标与边界

优先目标：

1. 跑通 tenant、strategy profile 与数据隔离。
2. 建立 Topic Graph、Query Cluster、Candidate 与 Published Page 模型。
3. 支持 `CREATE / EXPAND / MERGE / IGNORE` 决策。
4. 用不同 Page Type 输出不同页面结构。
5. 建立第一批 40–80 个经过意图区分的 Ita Bag 页面。
6. 尽快上线并开始积累 Search Console 数据。
7. 随后加入 Design Gallery + Voting MVP。

V1 明确不做：完整 CRM、ERP、购物车、支付、完整论坛、私信、复杂 RBAC、
SaaS Billing、自动多语言、自动发布大量页面、AI Humanizer、AI Detection、
高复杂 Agent Framework、Elasticsearch、Redis、未经证明必要的 Vector DB。

## 3. 产品原则

### SEO-first

任何后台或 SaaS 完整性需求都不能无故延迟首批高质量页面上线。

### Intent-first

唯一允许的核心流程是：

```text
query/topic -> intent -> page type -> brief -> reviewed page
```

禁止将每个关键词机械转换为一篇文章。多个词属于同一个意图时，应优先
聚类、合并或扩展既有页面。

### Research at scale, publishing with control

AI 可以规模化研究、分类、评分、生成候选项、Brief 与草稿，但 V1 不允许
默认自动发布。

### Narrow and deep

Ita Bag 站点的主题扩展优先级是 design、style、product type、feature、
use case、customization、material、component、inspiration 与 commercial
intent；`manufacturer/factory/supplier` 只属于低优先级意图。

## 4. 数据层严格分离

| 数据层 | 内容 | 原则 |
| --- | --- | --- |
| 公司信息库 | 简介、资质、能力、区域、联系方式、品牌与禁用表述 | 企业稳定私有事实 |
| 产品事实库 | SKU、材质、尺寸、工艺、配置、价格、交期、认证、案例 | 企业核心私有数据，优先级最高 |
| 行业知识库 | 通用参数、标准、术语、应用、对比、采购关注点 | 可复用公共知识，可由 Obsidian 管理 |
| 网站结构与内容库 | Topic Graph、页面、内链、Schema、Brief、版本 | 站点发布与维护事实 |

模型生成内容不得覆盖事实；事实之间冲突时必须进入人工审核。

## 5. 多租户约束

所有租户拥有的数据从第一版起必须包含 `tenant_id`。即使本地只有一个租户，
也不得把行业、域名、品牌、分类或 SEO strategy 写死在核心包中。

浏览器端只使用 Supabase anon key；service role 只能在可信服务端或工作流中使用。
应用层过滤不是隔离方案，数据库必须启用 RLS。

## 6. Strategy Profile

每个租户应拥有可版本化的 Strategy Profile：

```ts
type StrategyProfile = {
  businessModel:
    | 'design_driven_custom'
    | 'industrial_b2b'
    | 'project_b2b'
    | 'private_label'
    | 'commerce';
  primaryChannels: string[];
  primaryIntents: string[];
  secondaryIntents: string[];
  lowPriorityIntents: string[];
  allowedPageTypes: string[];
  publishingMode: 'manual' | 'review_required' | 'semi_automatic';
};
```

第一租户建议：

- primary channels: Google Search、Google Images、Pinterest、Instagram、TikTok
- primary intents: custom、design、style、feature、application、inspiration
- secondary intents: small batch、wholesale、group order、private label
- low priority: manufacturer、factory、supplier
- publishing mode: `review_required`

## 7. Topic / Entity Graph

系统核心不是 Keyword List，而是 Topic / Entity Graph。常见实体：Product、
Product Type、Material、Component、Feature、Design、Application、Style、Intent、
Page。关系需要使用明确 relation type，不能只把标签数组塞在一个字段内。

Graph 用于理解主题、发现缺口、建立内链、生成 Brief 和评估机会。Graph
绝不等于自动发布所有实体组合。

## 8. Page Types

V1 支持：`category`、`commercial`、`product`、`customization`、`component`、
`material`、`application`、`design_inspiration`、`comparison`、`guide`、
`gallery`、`community_topic`。

不同页面必须具有不同模块：

- Commercial/Product：价值、选项、应用、MOQ、样品、交期、CTA。
- Guide：问题、解释、步骤、示例、相关主题。
- Design Inspiration：视觉概念、风格、变化、关联设计、投票。
- Comparison：评价维度、差异、适用人群、限制、结论。

禁止所有页面复用统一 Blog Article 模板。

## 9. 内容生命周期

基础状态：

```text
idea -> candidate -> approved -> draft -> review -> published
                                           ↓          ↓
                                        archived   refresh
```

Candidate 是机会判断，Published Page 是站点事实，两者不能合并成一张表。
Candidate 的决策可以是：CREATE、EXPAND、MERGE、IGNORE。

## 10. Quality Gate

发布前至少检查：Intent Match、Topic Coverage、Originality、Information Gain、
Duplicate Risk、Cannibalization Risk、Commercial Usefulness、Evidence/Fact
Support、Visual Asset Availability、Internal Link Coverage。

不得增加“AI Detection Score”，也不以“像不像 AI”作为内容质量指标。

## 11. Design Asset 与社媒

Design Concept 是一等实体，可以关联图片、视频、SEO 页面、社媒内容、投票、
评论与产品样品。社媒不采用 `article -> rewrite -> post`，而采用：

```text
Content/Design Asset
├── SEO Page
├── Google Images
├── Pinterest Pin
├── Instagram Carousel/Reel
├── TikTok Video
├── Community Vote
└── Newsletter
```

V1.1 最小闭环：`Concept -> Vote -> Social -> Winner -> Sample -> Real Product`。

## 12. 第一阶段站点结构

```text
/
├── /ita-bags/
│   ├── /ita-backpacks/
│   ├── /ita-tote-bags/
│   ├── /ita-crossbody-bags/
│   └── /mini-ita-bags/
├── /custom/
│   ├── /window-shapes/
│   ├── /inserts/
│   ├── /materials/
│   └── /custom-design/
├── /ideas/
│   ├── /ita-bag-ideas/
│   ├── /pin-display/
│   ├── /photocard-display/
│   └── /plushie-display/
├── /guides/
├── /designs/
├── /how-it-works/
└── /contact/
```

## 13. 技术选择

- pnpm workspace：保持结构清晰，但避免过早引入重型 monorepo 工具。
- Astro：静态优先的 SEO 页面、Schema、图片优化、轻量 Islands。
- Supabase/PostgreSQL：多租户数据、Graph、Candidate、Metrics、Design、Voting。
- n8n：AI 和外部 API 编排，不承载唯一业务逻辑。
- TypeScript + Zod：跨包契约和运行时验证。

内容层在 V1 可用 Astro Content Collections 或轻量 Headless CMS。未出现真实
编辑协作瓶颈前，不急于引入 Strapi。

## 14. Codex 开发纪律

1. 每次任务先读 `AGENTS.md` 与相关文档。
2. 只完成一个有验收标准的边界任务。
3. Schema 修改必须创建 migration。
4. 新功能必须验证 tenant isolation。
5. 不把 Ita Bag 专属规则写入 core package。
6. 优先最小可运行实现，避免不必要依赖。
7. 修改后运行 `pnpm check`。
8. 汇报修改文件、数据库变化、测试、未完成内容与风险。

## 15. 衡量指标

第一阶段指标是 Time to First Indexed Pages、Indexed Pages、GSC Impressions、
Ranking Queries、Topic Coverage、Image Visibility、Social Engagement、Content
Maintenance Time 与 Qualified Inquiries，而不是功能数量、代码量或 Agent 数量。

## 16. V1 发布闭环

后台发布路径固定为：

```text
Candidate approved
  -> Create draft
  -> Edit structured page content
  -> Submit for review
  -> Publish
  -> /content/{slug} + sitemap
```

- `/admin` 管理候选内容和质量门槛。
- `/admin/pages` 管理草稿、审核、发布、更新和归档页面。
- Candidate 创建 Draft、页面状态推进均通过 Supabase 事务函数完成，禁止分别更新两张表。
- 发布动作会在数据库再次检查 Quality Gate、正文分区和段落完整性。
- 生产环境默认禁止种子数据回退；`ALLOW_SEED_FALLBACK=true` 仅用于本地演示与开发。
- 数据库变更先运行 `supabase db reset` 验证，再通过 `supabase db push --dry-run` 检查目标项目。
