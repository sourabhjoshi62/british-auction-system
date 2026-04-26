import { Trophy } from 'lucide-react'
import { formatCurrency, formatDateTime, formatDate } from '../utils/formatters'

export default function BidTable({ bids }) {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bids submitted yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Freight
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Origin
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Validity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bids.map((bid) => (
            <tr 
              key={bid.id} 
              className={`${bid.rank === 1 ? 'bg-green-50' : 'hover:bg-gray-50'} transition`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  {bid.rank === 1 && (
                    <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                  )}
                  <span className={`font-medium ${bid.rank === 1 ? 'text-green-600' : 'text-gray-900'}`}>
                    {bid.rankLabel}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-medium text-gray-900">{bid.supplierName}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                {formatCurrency(bid.freightCharges)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                {formatCurrency(bid.originCharges)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                {formatCurrency(bid.destinationCharges)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <span className={`font-bold ${bid.rank === 1 ? 'text-green-600' : 'text-gray-900'}`}>
                  {formatCurrency(bid.totalAmount)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                {bid.transitTimeDays ? `${bid.transitTimeDays} days` : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                {formatDate(bid.quoteValidityDate)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(bid.submittedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
