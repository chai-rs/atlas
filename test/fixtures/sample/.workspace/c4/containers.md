---
type: container-view
title: Containers
description: The web app, the API, and the database of the Tool Library.
status: draft
realization: planned
generated: { by: atlas/0.1.0, at: 2026-10-04T10:05:00Z }
---

# Containers

```mermaid
flowchart LR
	web[Web app] -- sends reservations and loans --> api[API]
	api -- reads and writes --> db[(Database)]
	api -- sends messages --> messages[[Message service]]
```

| From | To | Purpose |
| --- | --- | --- |
| Web app | [API](containers/api/container.md) | Reserve a tool, start a loan, end a loan |
| API | Database | Store members, tools, reservations, and loans |
| API | Message service | Send the pickup time and the return date |
