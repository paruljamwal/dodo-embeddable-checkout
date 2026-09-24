import type { MerchantLogEvent } from './events.ts'

type EventLogProps = {
  events: MerchantLogEvent[]
  onClear: () => void
}

function formatEventTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(timestamp)
}

function EventDetails({ event }: { event: MerchantLogEvent }) {
  if (event.type === 'onSuccess') {
    return (
      <dl className="event-log-details">
        <div>
          <dt>transactionId</dt>
          <dd>{event.payload.transactionId}</dd>
        </div>
        <div>
          <dt>productId</dt>
          <dd>{event.payload.productId}</dd>
        </div>
      </dl>
    )
  }

  if (event.type === 'onClose') {
    return (
      <dl className="event-log-details">
        <div>
          <dt>reason</dt>
          <dd>{event.payload.reason}</dd>
        </div>
      </dl>
    )
  }

  return (
    <dl className="event-log-details">
      <div>
        <dt>code</dt>
        <dd>{event.payload.code}</dd>
      </div>
      <div>
        <dt>message</dt>
        <dd>{event.payload.message}</dd>
      </div>
    </dl>
  )
}

export function EventLog({ events, onClear }: EventLogProps) {
  return (
    <section className="event-log" aria-labelledby="sdk-event-log-heading">
      <div className="event-log-header">
        <h2 id="sdk-event-log-heading">SDK Event Log</h2>
        {events.length > 0 ? (
          <button type="button" className="event-log-clear" aria-label="Clear event log" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      {events.length === 0 ? (
        <p className="event-log-empty">No SDK events yet. Open checkout to see callbacks here.</p>
      ) : (
        <ol className="event-log-list" role="log">
          {events.map((event) => (
            <li key={event.id} className="event-log-item">
              <p className="event-log-summary">
                <time dateTime={new Date(event.timestamp).toISOString()}>{formatEventTime(event.timestamp)}</time>
                <span className="event-log-type">{event.type}</span>
              </p>
              <EventDetails event={event} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
