import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

async function fetchCollectionsIndex() {
  const response = await fetch('/collections/index.json')
  return response.json()
}

export function Index() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections-index'],
    queryFn: fetchCollectionsIndex,
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

      {/* Search section */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Quick Search
        </h2>
        <p className="text-gray-600 mb-6">
          Search across all collections for academies, people, and works.
        </p>
        <div className="flex gap-4">
          <Link
            to="/academies"
            className="btn btn-primary"
          >
            Browse Academies
          </Link>
          <Link
            to="/people"
            className="btn btn-secondary"
          >
            Browse People
          </Link>
          <Link
            to="/works"
            className="btn btn-secondary"
          >
            Browse Works
          </Link>
        </div>
      </div>
    </div>
  )
} 