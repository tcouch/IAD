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

const columnHelper = createColumnHelper()

async function fetchWorks() {
  const response = await fetch('/collections/works.json')
  return response.json()
}

export function Works() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])

  const { data: worksData, isLoading } = useQuery({
    queryKey: ['works'],
    queryFn: fetchWorks,
  })

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    if (!worksData?.items) return null
    return new Fuse(worksData.items, {
      keys: ['ShortTitle', 'LongTitle', 'Subjects', 'Language', 'City.PublicationPlaceItalianName'],
      threshold: 0.3,
    })
  }, [worksData?.items])

  // Filter items based on search
  const filteredData = useMemo(() => {
    if (!worksData?.items || !globalFilter.trim()) return worksData?.items || []
    return fuse.search(globalFilter).map(result => result.item)
  }, [worksData?.items, globalFilter, fuse])

  const columns = useMemo(
    () => [
      columnHelper.accessor('ShortTitle', {
        header: 'Title',
        cell: ({ row }) => (
          <Link
            to="/works/$workId"
            params={{ workId: row.original.RecordId }}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            {row.original.ShortTitle}
          </Link>
        ),
      }),
      columnHelper.accessor('ItacAcademyItem.Value', {
        header: 'Academy',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('PublicationYear', {
        header: 'Year',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('City.PublicationPlaceItalianName', {
        header: 'Place',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('Language', {
        header: 'Language',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('Format', {
        header: 'Format',
        cell: ({ getValue }) => getValue() || '-',
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
            Browse {worksData?.totalItems.toLocaleString()} publications and works
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Works
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title, subject, language..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="input"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredData.length} of {worksData?.totalItems} works
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
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
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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