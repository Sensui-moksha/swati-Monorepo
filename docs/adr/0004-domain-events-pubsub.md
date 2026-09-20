# ADR 0004: Decoupled Domain Events Architecture

## Status
Accepted

## Context
In monolithic service structures, publishing a book or confirming an order often triggers inline synchronous calls to search indexing, recommendation recalculation, notification dispatch, and analytics logging. A failure or timeout in search indexing should never cause an order placement or article publish transaction to fail.

## Decision
We introduce an asynchronous, typed `EventBus`:
1. Core services emit domain events (e.g. `BookPublishedEvent`, `OrderCompletedEvent`, `SubscriptionCreatedEvent`).
2. Secondary concerns (Elasticsearch reindexing, push notifications, analytics) subscribe asynchronously.
3. High-throughput events are routed through Redis BullMQ with Dead Letter Queue (DLQ) support, exponential retries, and replay capabilities.

## Consequences
- Decouples bounded contexts and minimizes cascading failures.
- Drastically lowers request-response latency for primary write operations.
