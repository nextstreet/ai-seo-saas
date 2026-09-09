# SEO Engine

Reusable decision logic for intent, opportunity, quality, cannibalization,
internal linking, and topic gaps. It answers whether the system should create,
expand, merge, or ignore an opportunity. It must remain UI-free and
industry-neutral.

V1 includes a tenant-scoped Topic Graph service, an in-memory repository for
local composition/tests, cycle-safe traversal, and deterministic opportunity
scoring. A persistent repository can implement the same interface without
moving tenant or graph rules into the UI.
