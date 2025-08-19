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

async function fetchAcademies() {
  return apiCall(API_ENDPOINTS.collections.academies)
}

export function Academies() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])

  const { data: academyData, isLoading } = useQuery({
    queryKey: ['academies'],
    queryFn: fetchAcademies,
  })

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    if (!academyData?.items) return null
    return new Fuse(academyData.items, {
      keys: ['Name', 'AlternativeName', 'Motto', 'City.CityItalianName', 'City.CityEnglishName'],
      threshold: 0.3,
    })
  }, [academyData?.items])

  // Filter items based on search
  const filteredData = useMemo(() => {
    if (!academyData?.items || !globalFilter.trim()) return academyData?.items || []
    return fuse.search(globalFilter).map(result => result.item)
  }, [academyData?.items, globalFilter, fuse])

  const columns = useMemo(
    () => [
      columnHelper.accessor('Name', {
        header: 'Name',
        cell: ({ row }) => (
          <Link
            to="/academies/$academyId"
            params={{ academyId: row.original.RecordId }}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            {row.original.Name}
          </Link>
        ),
      }),
      columnHelper.accessor('City.CityItalianName', {
        header: 'City',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('StartDate', {
        header: 'Start Date',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('EndDate', {
        header: 'End Date',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('Motto', {
        header: 'Motto',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('memberCount', {
        header: 'Members',
        cell: ({ getValue }) => getValue() || 0,
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
            Browse {academyData?.totalItems.toLocaleString()} Italian academies
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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