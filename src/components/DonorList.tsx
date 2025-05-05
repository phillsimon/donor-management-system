import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import type { Donor } from '../types';
import { User, ArrowUpDown, Download, Search, Filter } from 'lucide-react';

const columnHelper = createColumnHelper<Donor>();

const columns = [
  columnHelper.accessor('First Name', {
    cell: info => info.getValue(),
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        First Name
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('Last Name', {
    cell: info => info.getValue(),
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Last Name
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('DS Rating', {
    cell: info => info.getValue(),
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Rating
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('Estimated Capacity', {
    cell: info => info.getValue(),
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Capacity
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('Total Of Likely Matches', {
    cell: info => info.getValue(),
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Total Giving
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('Business Revenue', {
    cell: info => info.getValue(),
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Business Revenue
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('Annual Fund Likelihood', {
    cell: info => `${info.getValue()}%`,
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Annual Fund
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
  columnHelper.accessor('Major Gift Likelihood', {
    cell: info => `${info.getValue()}%`,
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-700"
        onClick={() => column.toggleSorting()}
      >
        Major Gift
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  }),
];

interface DonorListProps {
  donors: Donor[];
  onSelectDonor: (donor: Donor) => void;
}

export function DonorList({ donors, onSelectDonor }: DonorListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minCapacity: '',
    minGiving: '',
    minAnnualFund: '',
    minMajorGift: '',
  });

  const table = useReactTable({
    data: donors,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const downloadCSV = () => {
    const fields = Object.keys(donors[0]);
    const csvContent = [
      fields.join(','),
      ...donors.map(donor => 
        fields.map(field => {
          const value = donor[field as keyof Donor];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'donor_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Donor List</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search donors..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. Capacity
            </label>
            <input
              type="number"
              value={filters.minCapacity}
              onChange={e => setFilters({ ...filters, minCapacity: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="$"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. Total Giving
            </label>
            <input
              type="number"
              value={filters.minGiving}
              onChange={e => setFilters({ ...filters, minGiving: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="$"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. Annual Fund %
            </label>
            <input
              type="number"
              value={filters.minAnnualFund}
              onChange={e => setFilters({ ...filters, minAnnualFund: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. Major Gift %
            </label>
            <input
              type="number"
              value={filters.minMajorGift}
              onChange={e => setFilters({ ...filters, minMajorGift: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="%"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                onClick={() => onSelectDonor(row.original)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}