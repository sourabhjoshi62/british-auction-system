// 


import { useState } from 'react'
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react'

export default function SubmitBidModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const [formData, setFormData] = useState({
    supplierId: '',
    freightCharges: '',
    originCharges: '0',
    destinationCharges: '0'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateTotal = () => {
    const freight = parseFloat(formData.freightCharges) || 0
    const origin = parseFloat(formData.originCharges) || 0
    const destination = parseFloat(formData.destinationCharges) || 0
    return freight + origin + destination
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Fake success (no API)
    setTimeout(() => {
      setResult({
        total: calculateTotal(),
        rank: "L1"
      })
      setLoading(false)
    }, 1000)
  }

  // Success screen
  if (result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Bid Submitted ✅</h2>

          <p>Total: ₹{result.total}</p>
          <p>Rank: {result.rank}</p>

          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Submit Bid</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="text-red-500 flex items-center mb-2">
            <AlertCircle className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="number"
            name="freightCharges"
            placeholder="Freight"
            value={formData.freightCharges}
            onChange={handleChange}
            className="w-full mb-2 p-2 border"
            required
          />

          <input
            type="number"
            name="originCharges"
            placeholder="Origin"
            value={formData.originCharges}
            onChange={handleChange}
            className="w-full mb-2 p-2 border"
          />

          <input
            type="number"
            name="destinationCharges"
            placeholder="Destination"
            value={formData.destinationCharges}
            onChange={handleChange}
            className="w-full mb-2 p-2 border"
          />

          <div className="mb-3">
            Total: ₹{calculateTotal()}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded"
          >
            <Send className="inline mr-2" />
            {loading ? "Submitting..." : "Submit Bid"}
          </button>

        </form>
      </div>
    </div>
  )
}