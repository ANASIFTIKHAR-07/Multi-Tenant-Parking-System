import React, { useEffect, useState } from 'react'
import { fetchCompanies, fetchFloors, fetchParkingSlots } from '../../services/adminApi.js'
import Button from '../../components/common/Button.jsx'
import { API_BASE_URL } from '../../services/http.js'

export default function Logs() {
  const [companies, setCompanies] = useState([])
  const [floors, setFloors] = useState([])
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ companyId: '', floorId: '', assigned: '' })

  const loadMeta = async () => {
    try { 
      const [companiesResponse, floorsResponse] = await Promise.all([fetchCompanies(), fetchFloors()])
      
      console.log('Companies response:', companiesResponse)
      console.log('Floors response:', floorsResponse)
      
      // Handle different possible response structures
      const companiesData = Array.isArray(companiesResponse) 
        ? companiesResponse 
        : companiesResponse?.data || companiesResponse?.companies || companiesResponse?.message || []
        
      const floorsData = Array.isArray(floorsResponse) 
        ? floorsResponse 
        : floorsResponse?.data || floorsResponse?.floors || floorsResponse?.message || []
      
      setCompanies(companiesData)
      setFloors(floorsData)
    } catch (e) { 
      console.error('Load meta error:', e)
      setError(e.message) 
    }
  }

  const load = async () => {
    try { 
      setLoading(true)
      const response = await fetchParkingSlots(filters)
      
      console.log('Slots response:', response)
      
      // Handle different possible response structures
      const slotsData = Array.isArray(response) 
        ? response 
        : response?.data || response?.slots || response?.message || []
      
      setSlots(slotsData) 
    } catch (e) { 
      console.error('Load slots error:', e)
      setError(e.message) 
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMeta() }, [])
  useEffect(() => { load() }, [filters.companyId, filters.floorId, filters.assigned])

  const exportCsv = () => {
    const url = new URL(`${API_BASE_URL}/csv/parking-logs/export`)
    Object.entries(filters).forEach(([k, v]) => { 
      if (v && v !== '') url.searchParams.set(k, v) 
    })
    // Open in same tab to trigger download with credentials
    window.location.href = url.toString()
  }

  // Add safety checks to ensure arrays
  const slotsArray = Array.isArray(slots) ? slots : []
  const companiesArray = Array.isArray(companies) ? companies : []
  const floorsArray = Array.isArray(floors) ? floors : []

  const assignedSlots = slotsArray.filter(s => s.employee && s.employee !== null).length
  const availableSlots = slotsArray.filter(s => !s.employee || s.employee === null).length
  const totalSlots = slotsArray.length

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Reports & Analytics</h1>
          <p className='text-gray-600 mt-1'>View parking assignments and export data for analysis</p>
        </div>
        <Button 
          onClick={exportCsv}
          className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
          </svg>
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-sm font-medium'>Total Records</p>
              <p className='text-3xl font-bold'>{totalSlots}</p>
            </div>
            <div className='w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
              </svg>
            </div>
          </div>
        </div>
        
        <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100 text-sm font-medium'>Available Slots</p>
              <p className='text-3xl font-bold'>{availableSlots}</p>
            </div>
            <div className='w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>
        
        <div className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100 text-sm font-medium'>Assigned Slots</p>
              <p className='text-3xl font-bold'>{assignedSlots}</p>
            </div>
            <div className='w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
            </div>
          </div>
        </div>
        
        <div className='bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-orange-100 text-sm font-medium'>Utilization Rate</p>
              <p className='text-3xl font-bold'>{totalSlots > 0 ? Math.round((assignedSlots / totalSlots) * 100) : 0}%</p>
            </div>
            <div className='w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Filter Data</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Company</label>
            <select 
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
              value={filters.companyId} 
              onChange={e => setFilters(v => ({ ...v, companyId: e.target.value }))}
            >
              <option value=''>All Companies</option>
              {companiesArray.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Floor</label>
            <select 
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
              value={filters.floorId} 
              onChange={e => setFilters(v => ({ ...v, floorId: e.target.value }))}
            >
              <option value=''>All Floors</option>
              {floorsArray.map(f => <option key={f._id} value={f._id}>Floor {f.floorNumber}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
            <select 
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
              value={filters.assigned} 
              onChange={e => setFilters(v => ({ ...v, assigned: e.target.value }))}
            >
              <option value=''>All</option>
              <option value='true'>Assigned</option>
              <option value='false'>Unassigned</option>
            </select>
          </div>
          <div className='flex items-end'>
            <Button 
              onClick={load}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white'
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3'>
          <svg className='w-5 h-5 text-red-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <span className='text-red-700 text-sm'>{error}</span>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='flex items-center space-x-3'>
            <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
            <span className='text-gray-600'>Loading data...</span>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>Parking Assignments Report</h3>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
                <span>{totalSlots} records found</span>
              </div>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Slot</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Floor</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Company</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Employee</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Vehicle</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>RFID</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {slotsArray.map((slot, index) => (
                  <tr key={slot._id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3'>
                          <span className='text-blue-600 font-semibold text-xs'>{slot.slotNumber}</span>
                        </div>
                        <span className='text-sm font-medium text-gray-900'>Slot {slot.slotNumber}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-900'>Floor {slot.floor?.floorNumber}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-900'>{slot.company?.name || 'Unassigned'}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-900'>{slot.employee?.name || 'Available'}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-900'>{slot.employee?.vehicleNumber || '-'}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-900 font-mono'>{slot.employee?.rfid || '-'}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {slot.employee ? (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                          Assigned
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && slotsArray.length === 0 && (
        <div className='text-center py-12'>
          <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>No data found</h3>
          <p className='mt-1 text-sm text-gray-500'>Try adjusting your filters or create some parking slots first.</p>
        </div>
      )}
    </div>
  )
}   