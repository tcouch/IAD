import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

async function fetchAcademy(academyId) {
  const response = await fetch('/items/academies.json')
  const academies = await response.json()
  return academies[academyId]
}

// Helper function to render paginated members
function PaginatedMembers({ members }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState('')
  const membersPerPage = 9
  const totalPages = Math.ceil(members.length / membersPerPage)
  
  // Track containers with their page numbers and IDs
  const [containers, setContainers] = useState([
    { id: 'prev', page: totalPages, position: 'left' },
    { id: 'current', page: 1, position: 'center' },
    { id: 'next', page: 2, position: 'right' }
  ])
  
  // Memoize the member card component to prevent re-renders
  const MemberCard = useCallback(({ person }) => (
    <Link
      key={person.RecordId}
      to="/people/$personId"
      params={{ personId: person.RecordId }}
      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
    >
      {/* Person Images */}
      <div className="flex items-center gap-3 mb-3">
        {person.PersonPortraitImage && (
          <div className="flex-shrink-0">
            <img
              src={`/images/${person.PersonPortraitImage.Value}`}
              alt={`Portrait of ${person.Name}`}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}
        
        {person.PersonEmblemImage && (
          <div className="flex-shrink-0">
            <img
              src={`/images/${person.PersonEmblemImage.Value}`}
              alt={`Emblem of ${person.Name}`}
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}
        
        {!person.PersonPortraitImage && !person.PersonEmblemImage && (
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-lg font-medium">
              {person.Name.split(',')[0]?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>

      <div className="font-medium text-gray-900">
        {person.Name}
      </div>
      {person.Nickname && (
        <div className="text-sm text-gray-600">
          "{person.Nickname}"
        </div>
      )}
      {person.Motto && (
        <div className="text-sm text-gray-500 italic mt-1">
          {person.Motto}
        </div>
      )}
      {person.PersonEmblemDescription && (
        <div className="text-xs text-gray-400 mt-1">
          {person.PersonEmblemDescription}
        </div>
      )}
    </Link>
  ), [])

  // Helper function to get members for a specific page
  const getMembersForPage = useCallback((page) => {
    const startIndex = (page - 1) * membersPerPage
    const endIndex = startIndex + membersPerPage
    return members.slice(startIndex, endIndex)
  }, [members, membersPerPage])

  // Memoize container content - containers never change their content
  const containerContent = useMemo(() => {
    const content = {}
    containers.forEach(container => {
      const members = getMembersForPage(container.page)
      const memberCards = members.map((person) => (
        <MemberCard key={`${person.RecordId}-${container.id}`} person={person} />
      ))
      content[container.id] = memberCards
    })
    return content
  }, [containers, getMembersForPage, MemberCard])

  const goToPage = useCallback((page) => {
    if (page === currentPage || isTransitioning) return
    
    const direction = page > currentPage ? 'slide-right' : 'slide-left'
    setSlideDirection(direction)
    setIsTransitioning(true)
    
    setTimeout(() => {
      setCurrentPage(page)
      
      // Update containers by adding/removing instead of changing content
      if (direction === 'slide-right') {
        // Moving forward: remove leftmost container, add new container to the right
        setContainers(prev => {
          const newContainers = prev.filter(c => c.position !== 'left')
          const newPage = page + 1
          const newId = `container-${Date.now()}` // Unique ID for new container
          
          return [
            ...newContainers.map(c => ({
              ...c,
              position: c.position === 'center' ? 'left' : 'center'
            })),
            ...(newPage <= totalPages ? [{ id: newId, page: newPage, position: 'right' }] : [])
          ]
        })
      } else {
        // Moving backward: remove rightmost container, add new container to the left
        setContainers(prev => {
          const newContainers = prev.filter(c => c.position !== 'right')
          const newPage = page - 1
          const newId = `container-${Date.now()}` // Unique ID for new container
          
          return [
            ...(newPage >= 1 ? [{ id: newId, page: newPage, position: 'left' }] : []),
            ...newContainers.map(c => ({
              ...c,
              position: c.position === 'center' ? 'right' : 'center'
            }))
          ]
        })
      }
      
      setSlideDirection('')
      setIsTransitioning(false)
    }, 300)
  }, [currentPage, isTransitioning, totalPages])

  // Reset containers when currentPage changes significantly (direct navigation)
  useEffect(() => {
    if (currentPage > 1) {
      const currentContainer = containers.find(c => c.position === 'center')
      if (currentContainer && currentContainer.page !== currentPage) {
        // Direct navigation detected - reset containers
        setContainers([
          { id: `container-${Date.now()}-1`, page: currentPage - 1 >= 1 ? currentPage - 1 : totalPages, position: 'left' },
          { id: `container-${Date.now()}-2`, page: currentPage, position: 'center' },
          { id: `container-${Date.now()}-3`, page: currentPage + 1 <= totalPages ? currentPage + 1 : 1, position: 'right' }
        ])
      }
    }
  }, [currentPage, totalPages, containers])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Members ({members.length})
        </h2>
        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mb-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || isTransitioning}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex space-x-1">
            {/* First page */}
            <button
              onClick={() => goToPage(1)}
              disabled={isTransitioning}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                1 === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              1
            </button>
            
            {/* Ellipsis after first page if needed */}
            {currentPage > 4 && (
              <span className="px-2 py-2 text-gray-400">...</span>
            )}
            
            {/* Pages around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (page === 1 || page === totalPages) return false
                return page >= currentPage - 2 && page <= currentPage + 2
              })
              .map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  disabled={isTransitioning}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {page}
                </button>
              ))}
            
            {/* Ellipsis before last page if needed */}
            {currentPage < totalPages - 3 && (
              <span className="px-2 py-2 text-gray-400">...</span>
            )}
            
            {/* Last page (if not already shown) */}
            {totalPages > 1 && (
              <button
                onClick={() => goToPage(totalPages)}
                disabled={isTransitioning}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  totalPages === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {totalPages}
              </button>
            )}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || isTransitioning}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Persistent Container Carousel */}
      <div className="relative overflow-hidden" style={{ minHeight: '500px' }}>
        {containers.map((container) => (
          <div 
            key={container.id}
            className={`absolute top-0 w-full grid grid-cols-3 gap-4 transition-transform duration-300 ease-in-out ${
              container.position === 'left' 
                ? slideDirection === 'slide-left' ? 'translate-x-0' : '-translate-x-full'
                : container.position === 'center'
                ? slideDirection === 'slide-right' ? '-translate-x-full' : 
                  slideDirection === 'slide-left' ? 'translate-x-full' : 'translate-x-0'
                : slideDirection === 'slide-right' ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {containerContent[container.id]}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AcademyDetail() {
  const { academyId } = useParams({ from: '/academies/$academyId' })
  
  const { data: academy, isLoading, error } = useQuery({
    queryKey: ['academy', academyId],
    queryFn: () => fetchAcademy(academyId),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !academy) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Academy Not Found</h1>
        <p className="text-gray-600 mb-4">The requested academy could not be found.</p>
        <Link to="/academies" className="btn btn-primary">
          Back to Academies
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/academies" className="text-primary-600 hover:text-primary-800">
          ← Back to Academies
        </Link>
      </div>

      {/* Academy Info */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {academy.Name}
            </h1>
            {academy.AlternativeName && (
              <p className="text-lg text-gray-600 mb-4">
                Also known as: {academy.AlternativeName}
              </p>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Location
                </h3>
                <p className="text-gray-900">
                  {academy.City?.CityItalianName} ({academy.City?.CityEnglishName})
                </p>
                {academy.City?.CityLatinName && (
                  <p className="text-sm text-gray-600">{academy.City.CityLatinName}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Active Period
                </h3>
                <p className="text-gray-900">
                  {academy.StartDate} - {academy.EndDate || 'Present'}
                </p>
                {academy.DateText && (
                  <p className="text-sm text-gray-600">{academy.DateText}</p>
                )}
              </div>
            </div>

            {academy.Motto && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Motto
                </h3>
                <p className="text-lg italic text-gray-900">"{academy.Motto}"</p>
              </div>
            )}

            {academy.EmblemDescription && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Emblem Description
                </h3>
                <p className="text-gray-900">{academy.EmblemDescription}</p>
              </div>
            )}
          </div>

          {/* Members with Pagination */}
          {academy.ItacPersonItem && academy.ItacPersonItem.length > 0 && (
            <PaginatedMembers members={academy.ItacPersonItem} />
          )}

          {/* Notes */}
          {academy.Notes && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{academy.Notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emblem Image */}
          {academy.EmblemImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emblem</h3>
              <img
                src={`/images/${academy.EmblemImage.Value}`}
                alt={`Emblem of ${academy.Name}`}
                className="w-full rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="hidden text-sm text-gray-500 text-center py-4">
                Image not available
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Academy ID</dt>
                <dd className="text-sm text-gray-900">{academy.AcademyId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Record ID</dt>
                <dd className="text-sm text-gray-900">{academy.RecordId}</dd>
              </div>
              {academy.ItacPersonItem && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Members</dt>
                  <dd className="text-sm text-gray-900">{academy.ItacPersonItem.length}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
} 