import { Link, Outlet } from '@tanstack/react-router'

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Italian Academies Database
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link
                to="/academies"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                activeProps={{ className: "text-primary-600 bg-primary-50" }}
              >
                Academies
              </Link>
              <Link
                to="/people"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                activeProps={{ className: "text-primary-600 bg-primary-50" }}
              >
                People
              </Link>
              <Link
                to="/works"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                activeProps={{ className: "text-primary-600 bg-primary-50" }}
              >
                Works
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
} 