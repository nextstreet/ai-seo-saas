# Workflows

n8n workflows orchestrate external APIs and scheduled jobs. They must call
versioned application contracts and must not become the only location where
business rules exist.

Start with documented manual flows. Export a workflow JSON only after it has
been tested, remove credentials before committing, and record required
environment variables beside the export.
