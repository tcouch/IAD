import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiCall, API_ENDPOINTS, getImagePath } from '../utils/api'

async function fetchPerson(personId) {
  const people = await apiCall(API_ENDPOINTS.items.people)
  return people[personId]
}

async function fetchWorks() {
  return apiCall(API_ENDPOINTS.collections.works)
}

export function PersonDetail() {
  const { personId } = useParams({ from: '/people/$personId' })
  
  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => fetchPerson(personId),
  })

  const { data: worksData } = useQuery({
    queryKey: ['works'],
    queryFn: fetchWorks,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Person Not Found</h1>
        <p className="text-gray-600 mb-4">The requested person could not be found.</p>
        <Link to="/people" className="btn btn-primary">
          Back to People
        </Link>
      </div>
    )
  }

  // Find works by this person
  const personWorks = worksData?.items?.filter(work => {
    const roles = ['Censors', 'Dedicatees', 'Editors', 'Artists', 'Illustrators', 'Printers']
    return roles.some(role => {
      const roleData = work[role]
      if (!roleData) return false
      
      if (Array.isArray(roleData.ItacPersonItem)) {
        return roleData.ItacPersonItem.some(p => p.RecordId === personId)
              } else if (roleData.ItacPersonItem) {
          return roleData.ItacPersonItem.RecordId === personId
      }
      return false
    })
  }) || []

  const fullName = [person.Surname, person.Forename].filter(Boolean).join(', ') || person.Name

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/people" className="text-primary-600 hover:text-primary-800">
          ← Back to People
        </Link>
      </div>

      {/* Person Info */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {fullName}
            </h1>
            {person.PersonalTitle && (
              <p className="text-lg text-gray-600 mb-4">
                {person.PersonalTitle}
              </p>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Lifespan
                </h3>
                <p className="text-gray-900">
                  {person.StartDate} - {person.EndDate || 'Present'}
                </p>
                {person.DateText && (
                  <p className="text-sm text-gray-600">{person.DateText}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Nationality
                </h3>
                <p className="text-gray-900">
                  {person.Nationality?.Value || 'Unknown'}
                </p>
              </div>
            </div>

            {person.Gender && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Gender
                </h3>
                <p className="text-gray-900">{person.Gender}</p>
              </div>
            )}

            {person.Role && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Role
                </h3>
                <p className="text-gray-900">{person.Role}</p>
              </div>
            )}
          </div>

          {/* Works */}
          {personWorks.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Works ({personWorks.length})
              </h2>
              <div className="space-y-4">
                {personWorks.map((work) => (
                  <Link
                    key={work.RecordId}
                    to="/works/$workId"
                    params={{ workId: work.RecordId }}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {work.ShortTitle}
                    </div>
                    {work.LongTitle && (
                      <div className="text-sm text-gray-600 mt-1">
                        {work.LongTitle}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      {work.PublicationYear} • {work.City?.PublicationPlaceItalianName}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Academy Memberships */}
          {person.academyMemberships && person.academyMemberships.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Academy Memberships ({person.academyMemberships.length})
              </h2>
              <div className="space-y-4">
                {person.academyMemberships.map((membership) => (
                  <Link
                    key={membership.academyRecordId}
                    to="/academies/$academyId"
                    params={{ academyId: membership.academyRecordId }}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {membership.academyName}
                    </div>
                    {membership.academyCity && (
                      <div className="text-sm text-gray-600 mt-1">
                        {membership.academyCity}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      Academy ID: {membership.academyId}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Citation */}
          {person.Citation && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Citation</h2>
              <p className="text-gray-700">{person.Citation}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Portrait Image */}
          {person.PersonPortraitImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portrait</h3>
              <img
                src={getImagePath(`/images/${person.PersonPortraitImage.Value}`)}
                alt={`Portrait of ${fullName}`}
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

          {/* Emblem Image */}
          {person.PersonEmblemImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Emblem</h3>
              <img
                src={getImagePath(`/images/${person.PersonEmblemImage.Value}`)}
                alt={`Emblem of ${fullName}`}
                className="w-full rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="hidden text-sm text-gray-500 text-center py-4">
                Image not available
              </div>
              {person.PersonEmblemDescription && (
                <p className="text-sm text-gray-600 mt-2">
                  {person.PersonEmblemDescription}
                </p>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Person ID</dt>
                <dd className="text-sm text-gray-900">{person.PersonId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Record ID</dt>
                <dd className="text-sm text-gray-900">{person.RecordId}</dd>
              </div>
              {personWorks.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Works</dt>
                  <dd className="text-sm text-gray-900">{personWorks.length}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
} 