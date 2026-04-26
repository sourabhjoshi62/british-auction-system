import { Clock, DollarSign, Award, Play, XCircle, CheckCircle } from 'lucide-react'
import { formatDateTime } from '../utils/formatters'

const EVENT_ICONS = {
  BID_SUBMITTED: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
  BID_UPDATED: { icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-100' },
  TIME_EXTENDED: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
  RANK_CHANGED: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-100' },
  AUCTION_STARTED: { icon: Play, color: 'text-green-500', bg: 'bg-green-100' },
  AUCTION_CLOSED: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  AUCTION_FORCE_CLOSED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' }
}

export default function ActivityLog({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity yet
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, index) => {
          const config = EVENT_ICONS[event.eventType] || EVENT_ICONS.BID_SUBMITTED
          const Icon = config.icon
          const isLast = index === events.length - 1

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${config.bg} flex items-center justify-center ring-8 ring-white`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">
                        {event.description}
                      </p>
                      <time className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDateTime(event.createdAt)}
                      </time>
                    </div>
                    
                    {event.triggeredByName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {event.triggeredByName}
                      </p>
                    )}

                    {event.eventType === 'TIME_EXTENDED' && event.previousCloseTime && (
                      <div className="mt-1 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 inline-block">
                        {formatDateTime(event.previousCloseTime)} → {formatDateTime(event.newCloseTime)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
