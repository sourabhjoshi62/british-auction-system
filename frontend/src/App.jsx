import { Routes, Route, Link } from 'react-router-dom'
import { Gavel, Plus, List } from 'lucide-react'
import RfqListPage from './pages/RfqListPage'
import CreateRfqPage from './pages/CreateRfqPage'
import RfqDetailsPage from './pages/RfqDetailsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Gavel className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  British Auction RFQ
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <List className="h-4 w-4" />
                <span>Auctions</span>
              </Link>
              <Link
                to="/rfqs/create"
                className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create RFQ</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<RfqListPage />} />
          <Route path="/rfqs/create" element={<CreateRfqPage />} />
          <Route path="/rfqs/:id" element={<RfqDetailsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App


