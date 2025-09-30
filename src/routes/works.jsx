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

async function fetchWorksSearchIndex() {
  return apiCall(API_ENDPOINTS.search.works)
}

export function Works() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])

  const { data: searchIndex, isLoading: indexLoading } = useQuery({
    queryKey: ['works-search-index'],
    queryFn: fetchWorksSearchIndex,
  })

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
      // If no search, return all works
      return searchIndex
    }
    
    // Get search results from index
    const searchResults = fuse.search(globalFilter)
    return searchResults.map(result => result.item)
  }, [searchIndex, globalFilter, fuse])

  const isLoading = indexLoading

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Title',
        size: 250,
        cell: ({ row }) => {
          const work = row.original
          return (
            <div className="max-w-[250px] truncate">
              <Link
                to="/works/$workId"
                params={{ workId: work.id }}
                className="text-primary-600 hover:text-primary-800 font-medium"
                title={work.name}
              >
                {work.name}
              </Link>
            </div>
          )
        },
      }),
      columnHelper.accessor('language', {
        header: 'Language',
        size: 100,
        cell: ({ row }) => {
          const work = row.original
          return work.language || '-'
        },
      }),
      columnHelper.accessor('publicationPlace', {
        header: 'Publication Place',
        size: 120,
        cell: ({ row }) => {
          const work = row.original
          return work.publicationPlace || '-'
        },
      }),
      columnHelper.accessor('publicationDate', {
        header: 'Publication Date',
        size: 120,
        cell: ({ row }) => {
          const work = row.original
          return work.publicationDate || '-'
        },
      }),
      columnHelper.accessor('subjects', {
        header: 'Subjects',
        size: 200,
        cell: ({ row }) => {
          const work = row.original
          const subjects = work.subjects || '-'
          return (
            <div className="max-w-[200px] truncate" title={subjects}>
              {subjects}
            </div>
          )
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
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
          <h1 className="text-3xl font-bold text-gray-900">Works</h1>
          <p className="text-gray-600 mt-2">
            Browse {searchIndex?.length.toLocaleString()} works from Italian academies
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search works
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search works by title, subjects, language..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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