import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

async function fetchWork(workId) {
  const response = await fetch('/items/works.json')
  const works = await response.json()
  return works[workId]
}

// Helper function to render person links
function PersonLinks({ people, title }) {
  if (!people) return null
  
  const personArray = Array.isArray(people.ItacPersonItem) 
    ? people.ItacPersonItem 
    : [people.ItacPersonItem]

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {personArray.map((person, index) => (
          <Link
            key={person.RecordID || index}
            to="/people/$personId"
            params={{ personId: person.RecordID }}
            className="block text-primary-600 hover:text-primary-800"
          >
            {person.Value}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Helper function to render images
function WorkImages({ work }) {
  const images = []
  
  if (work.TitlePageImage) {
    images.push({
      type: 'Title Page',
      image: work.TitlePageImage
    })
  }
  
  if (work.ColophonImage) {
    images.push({
      type: 'Colophon',
      image: work.ColophonImage
    })
  }
  
  if (images.length === 0) return null
  
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Images</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {images.map((item, index) => (
          <div key={index} className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.type}</h3>
            <img
              src={`/images/${item.image.Value}`}
              alt={`${item.type} of ${work.ShortTitle}`}
              className="w-full rounded-lg shadow-sm border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div className="hidden text-sm text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
              Image not available
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WorkDetail() {
  const { workId } = useParams({ from: '/works/$workId' })
  
  const { data: work, isLoading, error } = useQuery({
    queryKey: ['work', workId],
    queryFn: () => fetchWork(workId),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !work) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Work Not Found</h1>
        <p className="text-gray-600 mb-4">The requested work could not be found.</p>
        <Link to="/works" className="btn btn-primary">
          Back to Works
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/works" className="text-primary-600 hover:text-primary-800">
          ← Back to Works
        </Link>
      </div>

      {/* Work Info */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {work.ShortTitle}
            </h1>
            
            {work.LongTitle && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Full Title
                </h3>
                <p className="text-gray-900 italic">{work.LongTitle}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Academy
                </h3>
                {work.ItacAcademyItem ? (
                  <Link
                    to="/academies/$academyId"
                    params={{ academyId: work.ItacAcademyItem.RecordID }}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    {work.ItacAcademyItem.Value}
                  </Link>
                ) : (
                  <p className="text-gray-900">-</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Publication Year
                </h3>
                <p className="text-gray-900">{work.PublicationYear || '-'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Publication Place
                </h3>
                <p className="text-gray-900">
                  {work.City?.PublicationPlaceItalianName} ({work.City?.PublicationPlaceEnglishName})
                </p>
                {work.City?.PublicationPlaceLatinName && (
                  <p className="text-sm text-gray-600">{work.City.PublicationPlaceLatinName}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Language
                </h3>
                <p className="text-gray-900">{work.Language || '-'}</p>
              </div>
            </div>

            {work.Format && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Format
                </h3>
                <p className="text-gray-900">{work.Format}</p>
              </div>
            )}

            {work.Subjects && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Subjects
                </h3>
                <p className="text-gray-900">{work.Subjects}</p>
              </div>
            )}

            {work.Illustration && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Illustrations
                </h3>
                <p className="text-gray-900">{work.Illustration}</p>
              </div>
            )}

            {work.Pagination && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Pagination
                </h3>
                <p className="text-gray-900">{work.Pagination}</p>
              </div>
            )}

            {work.Shelfmark && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Shelfmark
                </h3>
                <p className="text-gray-900">{work.Shelfmark}</p>
              </div>
            )}

            {/* Associated People */}
            <PersonLinks people={work.Censors} title="Censors" />
            <PersonLinks people={work.Dedicatees} title="Dedicatees" />
            <PersonLinks people={work.Editors} title="Editors" />
            <PersonLinks people={work.Artists} title="Artists" />
            <PersonLinks people={work.Illustrators} title="Illustrators" />
            <PersonLinks people={work.Printers} title="Printers" />

            {work.CensorsAgreement && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Censors Agreement
                </h3>
                <p className="text-gray-900 text-sm">{work.CensorsAgreement}</p>
              </div>
            )}

            {work.Notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Notes
                </h3>
                <p className="text-gray-900">{work.Notes}</p>
              </div>
            )}
          </div>

          {/* Images */}
          <WorkImages work={work} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Work ID</dt>
                <dd className="text-sm text-gray-900">{work.WorkId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Record ID</dt>
                <dd className="text-sm text-gray-900">{work.RecordId}</dd>
              </div>
              {work.Marginalia && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Marginalia</dt>
                  <dd className="text-sm text-gray-900">{work.Marginalia}</dd>
                </div>
              )}
              {work.PrinterOrnament && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Printer Ornament</dt>
                  <dd className="text-sm text-gray-900">{work.PrinterOrnament}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Related Links */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related</h3>
            <div className="space-y-2">
              {work.ItacAcademyItem && (
                <Link
                  to="/academies/$academyId"
                  params={{ academyId: work.ItacAcademyItem.RecordID }}
                  className="block text-primary-600 hover:text-primary-800"
                >
                  View Academy
                </Link>
              )}
              <Link to="/works" className="block text-primary-600 hover:text-primary-800">
                Browse All Works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 