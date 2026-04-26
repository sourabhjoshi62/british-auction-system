import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, DollarSign, Users, RefreshCw, AlertCircle } from 'lucide-react'
import { rfqApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function RfqListPage() {
  const [rfqs, setRfqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

//   const fetchRfqs = async () => {
//     try {
//       setLoading(true)
//       const response = await rfqApi.getAll()
//       setRfqs(response.data)
//       setError(null)
//     } catch (err) {
//       setError('Failed to load auctions. Please try again.')
//       console.error('Error fetching RFQs:', err)
//     } finally {
//       setLoading(false)
//     }
//   }


const fetchRfqs = async () => {
  setLoading(true)

  // dummy data
  const data = [
    {
      id: 1,
      name: "Sample RFQ",
      referenceId: "RFQ-123",
      lowestBid: 1000,
      lowestBidSupplier: "ABC Logistics",
      bidCloseTime: new Date(),
      forcedCloseTime: new Date(),
      status: "ACTIVE",
      totalBids: 3,
      extensionCount: 1
    }
  ]

  setRfqs(data)
  setLoading(false)
}

  useEffect(() => {
    fetchRfqs()
    // Refresh every 30 seconds
    const interval = setInterval(fetchRfqs, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && rfqs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-red-700">{error}</span>
        <button
          onClick={fetchRfqs}
          className="ml-auto text-red-600 hover:text-red-700 font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">British Auctions</h1>
        <button
          onClick={fetchRfqs}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {rfqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions yet</h3>
          <p className="text-gray-500 mb-4">Create your first RFQ to get started</p>
          <Link
            to="/rfqs/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create RFQ
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFQ Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lowest Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forced Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bids
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <Link
                      to={`/rfqs/${rfq.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {rfq.name}
                    </Link>
                    <p className="text-sm text-gray-500">{rfq.referenceId}</p>
                  </td>
                  <td className="px-6 py-4">
                    {rfq.lowestBid ? (
                      <div>
                        <div className="flex items-center text-green-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(rfq.lowestBid)}
                        </div>
                        <p className="text-sm text-gray-500">{rfq.lowestBidSupplier}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">No bids yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {rfq.status === 'ACTIVE' ? (
                      <CountdownTimer targetTime={rfq.bidCloseTime} />
                    ) : (
                      <span className="text-gray-500">
                        {formatDateTime(rfq.bidCloseTime)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(rfq.forcedCloseTime)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={rfq.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{rfq.totalBids || 0}</span>
                    </div>
                    {rfq.extensionCount > 0 && (
                      <span className="text-xs text-orange-500">
                        +{rfq.extensionCount} extensions
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
