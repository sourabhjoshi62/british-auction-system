import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { RefreshCw, AlertCircle, Clock, Settings, Activity, PlusCircle } from 'lucide-react'
import { rfqApi, bidApi, supplierApi } from '../services/api'
import websocketService from '../services/websocket'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import BidTable from '../components/BidTable'
import ActivityLog from '../components/ActivityLog'
import SubmitBidModal from '../components/SubmitBidModal'
import { formatDateTime, formatCurrency } from '../utils/formatters'

export default function RfqDetailsPage() {
  const { id } = useParams()
  const [rfq, setRfq] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)

  const fetchRfq = useCallback(async () => {
    try {
      const response = await rfqApi.getById(id)
      setRfq(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load auction details')
      console.error('Error fetching RFQ:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchSuppliers = async () => {
    try {
      const response = await supplierApi.getAll()
      setSuppliers(response.data)
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }

  // Handle bid update from WebSocket
  const handleBidUpdate = useCallback((data) => {
    console.log('Received bid update:', data)
    // Refresh RFQ data to get updated bids and rankings
    fetchRfq()
  }, [fetchRfq])

  // Handle status update from WebSocket
  const handleStatusUpdate = useCallback((data) => {
    console.log('Received status update:', data)
    setRfq(data)
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.connect(
      () => {
        setWsConnected(true)
        websocketService.subscribeToBids(id, handleBidUpdate)
        websocketService.subscribeToStatus(id, handleStatusUpdate)
      },
      (error) => {
        console.error('WebSocket error:', error)
        setWsConnected(false)
      }
    )

    return () => {
      websocketService.unsubscribe(`bids-${id}`)
      websocketService.unsubscribe(`status-${id}`)
    }
  }, [id, handleBidUpdate, handleStatusUpdate])

  useEffect(() => {
    fetchRfq()
    fetchSuppliers()
  }, [fetchRfq])

  const handleBidSubmitted = () => {
    setShowBidModal(false)
    fetchRfq()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !rfq) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-red-700">{error || 'Auction not found'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{rfq.name}</h1>
              <StatusBadge status={rfq.status} />
              {wsConnected && (
                <span className="flex items-center text-xs text-green-600">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">{rfq.referenceId}</p>
            {rfq.description && (
              <p className="text-gray-600 mt-2">{rfq.description}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {rfq.status === 'ACTIVE' && (
              <>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Time Remaining</span>
                  <CountdownTimer 
                    targetTime={rfq.bidCloseTime} 
                    large 
                    onExpire={fetchRfq}
                  />
                </div>
                <button
                  onClick={() => setShowBidModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Submit Bid</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timing Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <span className="text-xs text-gray-500 uppercase">Start Time</span>
            <p className="text-sm font-medium">{formatDateTime(rfq.bidStartTime)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase">Current Close Time</span>
            <p className="text-sm font-medium">{formatDateTime(rfq.bidCloseTime)}</p>
            {rfq.originalCloseTime !== rfq.bidCloseTime && (
              <p className="text-xs text-orange-500">
                Original: {formatDateTime(rfq.originalCloseTime)}
              </p>
            )}
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase">Forced Close</span>
            <p className="text-sm font-medium text-red-600">{formatDateTime(rfq.forcedCloseTime)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase">Lowest Bid</span>
            {rfq.lowestBid ? (
              <p className="text-sm font-medium text-green-600">{formatCurrency(rfq.lowestBid)}</p>
            ) : (
              <p className="text-sm text-gray-400">No bids yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Auction Configuration */}
      {rfq.britishAuctionEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">British Auction Configuration</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Trigger Window:</span>
              <span className="ml-1 font-medium">{rfq.triggerWindowMinutes} minutes</span>
            </div>
            <div>
              <span className="text-blue-700">Extension Duration:</span>
              <span className="ml-1 font-medium">{rfq.extensionDurationMinutes} minutes</span>
            </div>
            <div>
              <span className="text-blue-700">Trigger Type:</span>
              <span className="ml-1 font-medium">{rfq.extensionTriggerType.replace('_', ' ')}</span>
            </div>
          </div>
          {rfq.extensionCount > 0 && (
            <p className="mt-2 text-sm text-orange-600">
              <Clock className="h-4 w-4 inline mr-1" />
              This auction has been extended {rfq.extensionCount} time(s)
            </p>
          )}
        </div>
      )}

      {/* Bids Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Supplier Bids ({rfq.bids?.length || 0})
          </h2>
          <button
            onClick={fetchRfq}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
        <BidTable bids={rfq.bids || []} />
      </div>

      {/* Activity Log */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>
        </div>
        <ActivityLog events={rfq.eventLogs || []} />
      </div>

      {/* Submit Bid Modal */}
      {showBidModal && (
        <SubmitBidModal
          rfqId={rfq.id}
          suppliers={suppliers}
          onClose={() => setShowBidModal(false)}
          onSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  )
}
