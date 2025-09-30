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

async function fetchAcademySearchIndex() {
  return apiCall(API_ENDPOINTS.search.academies)
}

export function Academies() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])

  const { data: searchIndex, isLoading: indexLoading } = useQuery({
    queryKey: ['academies-search-index'],
    queryFn: fetchAcademySearchIndex,
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
      // If no search, return all academies
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
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const academy = row.original
          return (
            <div className="max-w-[200px] truncate">
              <Link
                to="/academies/$academyId"
                params={{ academyId: academy.id }}
                className="text-primary-600 hover:text-primary-800 font-medium"
                title={academy.name}
              >
                {academy.name}
              </Link>
            </div>
          )
        },
      }),
      columnHelper.accessor('city', {
        header: 'City',
        size: 120,
        cell: ({ row }) => {
          const academy = row.original
          return academy.city || '-'
        },
      }),
      columnHelper.accessor('startDate', {
        header: 'Start Date',
        size: 100,
        cell: ({ row }) => {
          const academy = row.original
          return academy.startDate || '-'
        },
      }),
      columnHelper.accessor('endDate', {
        header: 'End Date',
        size: 100,
        cell: ({ row }) => {
          const academy = row.original
          return academy.endDate || '-'
        },
      }),
      columnHelper.accessor('motto', {
        header: 'Motto',
        size: 200,
        cell: ({ row }) => {
          const academy = row.original
          const motto = academy.motto || '-'
          return (
            <div className="max-w-[200px] truncate" title={motto}>
              {motto}
            </div>
          )
        },
      }),
      columnHelper.accessor('memberCount', {
        header: 'Members',
        size: 80,
        cell: ({ row }) => {
          const academy = row.original
          return academy.memberCount || 0
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
          <h1 className="text-3xl font-bold text-gray-900">Academies</h1>
          <p className="text-gray-600 mt-2">
            Browse {searchIndex?.length.toLocaleString()} Italian academies
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search academies
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search academies by name, city, motto..."
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