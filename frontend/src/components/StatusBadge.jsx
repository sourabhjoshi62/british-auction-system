export default function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Draft'
    },
    ACTIVE: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Active'
    },
    CLOSED: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Closed'
    },
    FORCE_CLOSED: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Force Closed'
    }
  }

  const config = statusConfig[status] || statusConfig.DRAFT

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
