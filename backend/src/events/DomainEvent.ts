export interface IDomainEvent<T = any> {
  id: string;
  name: string;
  timestamp: Date;
  payload: T;
  correlationId?: string;
  actorId?: string;
}

export interface DeadLetterItem {
  id: string;
  event: IDomainEvent;
  error: string;
  failedAt: Date;
  retryCount: number;
}

export interface EventBusMetrics {
  totalPublished: number;
  totalDelivered: number;
  totalFailed: number;
  dlqLength: number;
  eventsByName: Record<string, number>;
}
