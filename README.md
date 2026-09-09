# AI SEO SaaS V1

面向独立站的多租户、意图驱动 AI SEO 系统第一版。第一验证租户为
Custom Ita Bag，但核心引擎不绑定单一行业。

V1 的目标不是“生成最多文章”，而是尽快跑通：

```text
Facts -> Topic Graph -> Candidate -> Brief -> Review -> Page -> Performance
```

## 快速开始

```bash
cp .env.example .env
pnpm install
pnpm dev
```

验证整个仓库：

```bash
pnpm check
```

本地 Supabase（需要 Docker 与 Supabase CLI）：

```bash
supabase start
supabase db reset
```

## 当前可演示闭环

- `/studio/`：在构建时运行 Topic Graph、机会评分、人工批准与 Brief 生成。
- `/custom/custom-ita-bag-design/`：经过审核的 customization 页面。
- `/guides/how-to-design-an-ita-bag/`：经过审核的 guide 页面。
- 每篇内容均由类型化 Content Collection 校验，并输出 canonical、结构化数据、面包屑和相关链接。
- 候选状态只能沿受控路径推进；数据库 migration 保存带理由的状态历史。

当前 Studio 使用确定性的内存仓储作为本地演示。Supabase schema 是持久化边界，接入线上项目前仍需在本地执行 migration reset 和 RLS 集成测试。

## 目录

| 路径 | 职责 |
| --- | --- |
| `apps/web` | Astro SEO 网站与后续轻量后台 |
| `packages/shared` | 通用类型、Schema、常量 |
| `packages/seo-engine` | SEO 决策与机会评分 |
| `packages/content-engine` | Brief、事实注入、内容验证 |
| `supabase` | PostgreSQL migration 与种子数据 |
| `workflows/n8n` | n8n 集成说明和后续工作流 |
| `docs` | 架构、数据库、路线图和本地开发上下文 |

请先阅读 [AGENTS.md](AGENTS.md) 与
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)。全部文档入口见
[docs/README.md](docs/README.md)。
