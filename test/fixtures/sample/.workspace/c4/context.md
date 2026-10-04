---
type: system-context
title: System context
description: The Tool Library, the people who use it, and the message service that it calls.
status: draft
realization: planned
generated: { by: atlas/0.1.0, at: 2026-10-04T10:05:00Z }
---

# System context

```mermaid
flowchart LR
	member([Member]) -- reserves a tool --> library[Tool Library]
	desk([Desk]) -- records each loan --> library
	library -- sends the return date --> messages[[Message service]]
```

| From | To | Purpose |
| --- | --- | --- |
| Member | Tool Library | Reserve a tool |
| Desk | Tool Library | Start and end a loan |
| Tool Library | Message service | Send the pickup time and the return date |

The message service is an external system.
