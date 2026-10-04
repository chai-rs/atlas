---
type: journey
title: Borrow a tool
description: A member reserves a tool and collects it at the desk.
status: draft
realization: planned
generated: { by: atlas/0.1.0, at: 2026-10-04T10:05:00Z }
---

# Borrow a tool

This journey delivers the capability [Lend tools](../capabilities/lend-tools.md).

The trigger is a member who needs a tool. The outcome is a loan.

```mermaid
sequenceDiagram
	actor Member
	participant Library as Tool Library
	actor Desk
	Member->>Library: Reserve a tool
	Library-->>Member: Confirm the pickup time
	Member->>Desk: Ask for the tool at the pickup time
	Desk->>Library: Start the loan
	Library-->>Member: Send the return date
```

## Rules

A member can hold one reservation for each tool. The library refuses a reservation when the member has an overdue loan.

```mermaid
flowchart TD
	request[Member asks for a reservation] --> overdue{Overdue loan?}
	overdue -- yes --> refuse[Refuse the reservation]
	overdue -- no --> free{Tool free at that time?}
	free -- no --> refuse
	free -- yes --> hold[Create the reservation]
```
