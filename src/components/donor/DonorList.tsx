import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import type { Donor } from '../../types';
import { User, ArrowUpDown, Download, Search, Filter, Upload, Trash2, Edit, Loader2 } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { DonorUpdateForm } from '../DonorUpdateForm';
import { useAuth } from '../../contexts/AuthContext';
import { useDonors } from '../../hooks/useDonors';

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
  columnHelper.display({
    id: 'actions',
    cell: info => (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            info.table.options.meta?.onUpdateDonor(info.row.original);
          }}
          className="p-2 text-purple-600 hover:text-purple-800 rounded-full hover:bg-purple-50"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            info.table.options.meta?.onDeleteDonor(info.row.original);
          }}
          className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
    header: () => <span className="sr-only">Actions</span>,
  }),
];

interface DonorListProps {
  donors: Donor[];
  onSelectDonor: (donor: Donor) => void;
  onAddDonors: (donors: Donor[]) => void;
  onDeleteDonor: (donor: Donor) => void;
  onUpdateDonor: (donor: Donor) => void;
}

export function DonorList({ 
  donors, 
  onSelectDonor, 
  onAddDonors, 
  onDeleteDonor,
  onUpdateDonor 
}: DonorListProps) {
  const { loading: authLoading, user } = useAuth();
  const { loading: donorsLoading, donors: donorsList, error } = useDonors();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [filters, setFilters] = useState({
    minCapacity: '',
    minGiving: '',
    minAnnualFund: '',
    minMajorGift: '',
  });
  const location = useLocation();
  const tableRef = useRef<any>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (table) {
      table.resetSorting();
      table.resetGlobalFilter();
    }
  }, [location.search]);

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
    meta: {
      onDeleteDonor: (donor: Donor) => onDeleteDonor(donor),
      onUpdateDonor: (donor: Donor) => setSelectedDonor(donor),
    },
  });

  useEffect(() => {
    tableRef.current = table;
  }, [table]);

  const downloadCSV = () => {
    const fields = Object.keys(donors[0] || {});
    if (fields.length === 0) return;

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

  const handleUploadComplete = (newDonors: Donor[]) => {
    onAddDonors(newDonors);
    setShowUpload(false);
  };

  const handleUpdateComplete = (updatedDonor: Donor) => {
    onUpdateDonor(updatedDonor);
    setSelectedDonor(null);
  };

  if (selectedDonor) {
    return (
      <DonorUpdateForm
        donor={selectedDonor}
        onSave={handleUpdateComplete}
        onCancel={() => setSelectedDonor(null)}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (donorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

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
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={donors.length === 0}
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-6">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>
      )}

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

      {donors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No donors found. Upload a CSV file to get started.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}