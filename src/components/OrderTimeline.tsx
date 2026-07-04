import type { OrderStatus, TrackingEvent } from "@prisma/client";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, formatDateTime } from "@/lib/utils";

/**
 * Delivery progress: the standard journey with reached-steps filled in,
 * plus the detailed event log (location + note) underneath.
 */
export function OrderTimeline({
  status,
  events,
}: {
  status: OrderStatus;
  events: TrackingEvent[];
}) {
  const cancelled = status === "CANCELLED";
  const reachedIdx = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div>
      {!cancelled && (
        <ol className="flex items-start">
          {ORDER_STATUS_FLOW.map((step, i) => {
            const done = i <= reachedIdx;
            const last = i === ORDER_STATUS_FLOW.length - 1;
            return (
              <li key={step} className={last ? "" : "flex-1"}>
                <div className="flex items-center">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      done ? "border-burgundy bg-burgundy" : "border-ink/25 bg-white"
                    }`}
                  >
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#faf7f2" strokeWidth="3.5">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {!last && (
                    <span className={`h-0.5 flex-1 ${i < reachedIdx ? "bg-burgundy" : "bg-ink/15"}`} />
                  )}
                </div>
                <p
                  className={`mt-2 pr-2 text-[11px] leading-tight ${
                    done ? "font-medium text-ink" : "text-ink-faint"
                  }`}
                >
                  {ORDER_STATUS_LABEL[step]}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {/* event log */}
      <div className={`${cancelled ? "" : "mt-8"} space-y-0`}>
        {events.map((event, i) => (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && (
              <span className="absolute left-[5px] top-4 h-full w-px bg-ink/15" />
            )}
            <span
              className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ${
                event.status === "CANCELLED" ? "bg-red-700" : "bg-burgundy"
              }`}
            />
            <div className="text-sm">
              <p className="font-medium">{ORDER_STATUS_LABEL[event.status]}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {formatDateTime(event.createdAt)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
              {event.note && <p className="mt-1 text-xs text-ink-soft">{event.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
