import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Fuse from 'fuse.js'
import { apiCall, API_ENDPOINTS } from '../utils/api'

const columnHelper = createColumnHelper()

async function fetchPeopleSearchIndex() {
  return apiCall(API_ENDPOINTS.search.people)
}

export function People() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [sorting, setSorting] = useState([])

  const { data: searchIndex, isLoading: indexLoading } = useQuery({
    queryKey: ['people-search-index'],
    queryFn: fetchPeopleSearchIndex,
  })

  // Extract unique nationalities for filter dropdown
  const nationalities = useMemo(() => {
    if (!searchIndex) return []
    
    const nationalitySet = new Set()
    searchIndex.forEach(person => {
      if (person.nationality && person.nationality !== '-') {
        nationalitySet.add(person.nationality)
      }
    })
    
    return Array.from(nationalitySet).sort()
  }, [searchIndex])

  // Create Fuse instance with pre-built search index
  const fuse = useMemo(() => {
    if (!searchIndex) return null
    return new Fuse(searchIndex, {
      keys: ['searchText'],
      threshold: 0.3,
    })
  }, [searchIndex])

  // Get search results directly from index
  const filteredData = useMemo(() => {
    if (!searchIndex) return []
    
    if (!globalFilter.trim()) {
      // If no search, return all people
      return searchIndex
    }
    
    // Get search results from index
    const searchResults = fuse.search(globalFilter)
    return searchResults.map(result => result.item)
  }, [searchIndex, globalFilter, fuse])

  // Apply nationality filter to search results
  const nationalityFilteredData = useMemo(() => {
    if (!nationalityFilter) return filteredData
    
    return filteredData.filter(person => person.nationality === nationalityFilter)
  }, [filteredData, nationalityFilter])

  const isLoading = indexLoading

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const person = row.original
          return (
            <div className="max-w-[200px] truncate">
              <Link
                to="/people/$personId"
                params={{ personId: person.id }}
                className="text-primary-600 hover:text-primary-800 font-medium"
                title={person.name}
              >
                {person.name}
              </Link>
            </div>
          )
        },
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        size: 200,
        cell: ({ row }) => {
          const person = row.original
          const title = person.title || '-'
          return (
            <div className="max-w-[200px] truncate" title={title}>
              {title}
            </div>
          )
        },
      }),
      columnHelper.accessor('lifespan', {
        header: 'Lifespan',
        size: 120,
        cell: ({ row }) => {
          const person = row.original
          return person.lifespan || '-'
        },
      }),
      columnHelper.accessor('nationality', {
        header: 'Nationality',
        size: 120,
        cell: ({ row }) => {
          const person = row.original
          return person.nationality || '-'
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: nationalityFilteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600 mt-2">
            Browse {searchIndex?.length.toLocaleString()} people from Italian academies
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search people
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search people by name, title, nationality..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="nationality" className="sr-only">
              Filter by nationality
            </label>
            <select
              id="nationality"
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Nationalities</option>
              {nationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? '↑' : 
                             header.column.getIsSorted() === 'desc' ? '↓' : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 