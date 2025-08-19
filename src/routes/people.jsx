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

async function fetchPeople() {
  const response = await fetch('/collections/people.json')
  return response.json()
}

export function People() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [sorting, setSorting] = useState([])

  const { data: peopleData, isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: fetchPeople,
  })

  // Extract unique nationalities for filter dropdown
  const filterOptions = useMemo(() => {
    if (!peopleData?.items) return { nationalities: [] }
    
    const nationalities = new Set()
    
    peopleData.items.forEach(person => {
      if (person.Nationality?.Value) {
        nationalities.add(person.Nationality.Value)
      }
    })
    
    return {
      nationalities: Array.from(nationalities).sort()
    }
  }, [peopleData?.items])

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    if (!peopleData?.items) return null
    return new Fuse(peopleData.items, {
      keys: [
        'Surname', 
        'Forename', 
        'PersonalTitle', 
        'Nationality.Value', 
        'Role',
        'Nickname'
      ],
      threshold: 0.3,
    })
  }, [peopleData?.items])

  // Filter items based on search and nationality filter
  const filteredData = useMemo(() => {
    if (!peopleData?.items) return []
    
    let filtered = peopleData.items
    
    // Apply text search filter
    if (globalFilter.trim()) {
      filtered = fuse.search(globalFilter).map(result => result.item)
    }
    
    // Apply nationality filter
    if (nationalityFilter) {
      filtered = filtered.filter(person => 
        person.Nationality?.Value === nationalityFilter
      )
    }
    
    return filtered
  }, [peopleData?.items, globalFilter, nationalityFilter, fuse])

  const columns = useMemo(
    () => [
      columnHelper.accessor('Surname', {
        header: 'Name',
        cell: ({ row }) => {
          const person = row.original
          const fullName = [person.Surname, person.Forename].filter(Boolean).join(', ')
          return (
            <Link
              to="/people/$personId"
              params={{ personId: person.RecordId }}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              {fullName || person.Name || 'Unknown'}
            </Link>
          )
        },
      }),
      columnHelper.accessor('Nickname', {
        header: 'Nickname',
        cell: ({ getValue }) => {
          const nickname = getValue()
          return nickname ? `"${nickname}"` : '-'
        },
      }),
      columnHelper.accessor('PersonalTitle', {
        header: 'Title',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('DateText', {
        header: 'Lifespan',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('Nationality.Value', {
        header: 'Nationality',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('Role', {
        header: 'Role',
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('Gender', {
        header: 'Gender',
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
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600 mt-2">
            Browse {peopleData?.totalItems.toLocaleString()} people associated with Italian academies
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="space-y-4">
          {/* Text Search */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search People
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name, title, nationality..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="input"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredData.length} of {peopleData?.totalItems} people
            </div>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex gap-4 items-end">
            <div>
              <label htmlFor="nationality-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <select
                id="nationality-filter"
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="input min-w-[200px]"
              >
                <option value="">All Nationalities</option>
                {filterOptions.nationalities.map(nationality => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {(nationalityFilter) && (
              <button
                onClick={() => {
                  setNationalityFilter('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
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