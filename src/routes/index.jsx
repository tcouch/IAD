import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiCall, API_ENDPOINTS } from '../utils/api'

async function fetchSearchIndices() {
  const [academies, people, works] = await Promise.all([
    apiCall(API_ENDPOINTS.search.academies),
    apiCall(API_ENDPOINTS.search.people),
    apiCall(API_ENDPOINTS.search.works)
  ])
  
  return {
    academies: {
      count: academies.length,
      name: 'Academies',
      description: 'Italian academies and their members'
    },
    people: {
      count: people.length,
      name: 'People',
      description: 'Members and associates of Italian academies'
    },
    works: {
      count: works.length,
      name: 'Works',
      description: 'Publications and works related to Italian academies'
    }
  }
}

export function Index() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections-index'],
    queryFn: fetchSearchIndices,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Italian Academies Database
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore the rich history of Italian academies, their members, and works from the Renaissance and early modern periods.
        </p>
      </div>

      {/* Collections overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {collections && Object.entries(collections).map(([key, collection]) => (
          <Link
            key={key}
            to={`/${key}`}
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {collection.name}
            </h2>
            <p className="text-gray-600 mb-4">
              {collection.description}
            </p>
            <div className="text-sm text-primary-600 font-medium">
              {collection.count.toLocaleString()} items →
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
} 