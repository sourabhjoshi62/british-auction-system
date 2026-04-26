import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, AlertCircle, Info } from 'lucide-react'
import { rfqApi } from '../services/api'

const TRIGGER_TYPES = [
  { value: 'BID_RECEIVED', label: 'Any Bid Received', description: 'Extend when any bid is placed during trigger window' },
  { value: 'RANK_CHANGE', label: 'Any Rank Change', description: 'Extend when any supplier ranking changes' },
  { value: 'L1_CHANGE', label: 'L1 (Lowest Bidder) Change', description: 'Extend only when the lowest bidder changes' }
]

export default function CreateRfqPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bidStartTime: '',
    bidCloseTime: '',
    forcedCloseTime: '',
    pickupDate: '',
    britishAuctionEnabled: true,
    triggerWindowMinutes: 10,
    extensionDurationMinutes: 5,
    extensionTriggerType: 'BID_RECEIVED'
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate times
      const start = new Date(formData.bidStartTime)
      const close = new Date(formData.bidCloseTime)
      const forced = new Date(formData.forcedCloseTime)

      if (close <= start) {
        setError('Bid close time must be after bid start time')
        setLoading(false)
        return
      }

      if (forced <= close) {
        setError('Forced close time must be after bid close time')
        setLoading(false)
        return
      }

      const response = await rfqApi.create(formData)
      navigate(`/rfqs/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create RFQ. Please try again.')
      console.error('Error creating RFQ:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New RFQ</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFQ Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Q2 Logistics Service Procurement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup / Service Date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Auction Timing */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Auction Timing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Start Time *
              </label>
              <input
                type="datetime-local"
                name="bidStartTime"
                value={formData.bidStartTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Close Time *
              </label>
              <input
                type="datetime-local"
                name="bidCloseTime"
                value={formData.bidCloseTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forced Close Time *
              </label>
              <input
                type="datetime-local"
                name="forcedCloseTime"
                value={formData.forcedCloseTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auction will end at this time regardless of extensions
              </p>
            </div>
          </div>
        </div>

        {/* British Auction Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">British Auction Settings</h2>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="britishAuctionEnabled"
                checked={formData.britishAuctionEnabled}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable British Auction</span>
            </label>
          </div>

          {formData.britishAuctionEnabled && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  British Auction automatically extends bidding when activity occurs near the close time.
                  This prevents last-second bidding and encourages fair competition.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trigger Window (X minutes)
                  </label>
                  <input
                    type="number"
                    name="triggerWindowMinutes"
                    value={formData.triggerWindowMinutes}
                    onChange={handleChange}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Monitor for activity X minutes before close
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extension Duration (Y minutes)
                  </label>
                  <input
                    type="number"
                    name="extensionDurationMinutes"
                    value={formData.extensionDurationMinutes}
                    onChange={handleChange}
                    min={1}
                    max={30}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Add Y minutes when triggered
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension Trigger Type
                </label>
                <div className="space-y-2">
                  {TRIGGER_TYPES.map(({ value, label, description }) => (
                    <label
                      key={value}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                        formData.extensionTriggerType === value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="extensionTriggerType"
                        value={value}
                        checked={formData.extensionTriggerType === value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">{label}</span>
                        <span className="block text-xs text-gray-500">{description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create RFQ'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
