import React, { useEffect, useState } from 'react'
import { createParkingSlots, deleteParkingSlot, fetchCompanies, fetchFloors, fetchParkingSlots, updateParkingSlot } from '../../services/adminApi.js'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'

export default function Slots() {
  const [floors, setFloors] = useState([])
  const [companies, setCompanies] = useState([])
  const [slots, setSlots] = useState([])
  const [filters, setFilters] = useState({ floorId: '', companyId: '', assigned: '' })
  const [bulk, setBulk] = useState({ floorId: '', start: 1, end: 10 })
  const [assign, setAssign] = useState({ id: '', employee: { name: '', vehicleNumber: '', rfid: '' } })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)

  const loadMeta = async () => {
    try {
      const [floorsResponse, companiesResponse] = await Promise.all([fetchFloors(), fetchCompanies()])
      
      // Handle different possible response structures
      const floorsData = Array.isArray(floorsResponse) 
        ? floorsResponse 
        : floorsResponse?.data || floorsResponse?.floors || floorsResponse?.message || []
        
      const companiesData = Array.isArray(companiesResponse) 
        ? companiesResponse 
        : companiesResponse?.data || companiesResponse?.companies || companiesResponse?.message || []
      
      setFloors(floorsData)
      setCompanies(companiesData)
      
      console.log('Loaded floors:', floorsData)
      console.log('Loaded companies:', companiesData)
    } catch (e) { 
      console.error('Load meta error:', e)
      setError(e.message) 
    }
  }

  const loadSlots = async () => {
    try { 
      setLoading(true)
      setError('') // Clear previous errors
      
      // Build query parameters
      const queryParams = {}
      if (filters.floorId) queryParams.floorId = filters.floorId
      if (filters.companyId) queryParams.companyId = filters.companyId
      if (filters.assigned !== '') queryParams.assigned = filters.assigned
      
      console.log('Loading slots with filters:', queryParams)
      
      const response = await fetchParkingSlots(queryParams)
      
      // Debug: Log first slot and floors to understand structure
      console.log('First slot company:', response?.[0]?.company)
      console.log('Available floors structure:', floorsArray)
      
      // Handle different possible response structures
      const slotsData = Array.isArray(response) 
        ? response 
        : response?.data || response?.slots || response?.message || []
      
      console.log('Loaded slots:', slotsData)
      setSlots(slotsData)
    } catch (e) { 
      console.error('Load slots error:', e)
      setError(e.message) 
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMeta() }, [])
  
  // Load slots when filters change OR when component first mounts
  useEffect(() => { 
    loadSlots() 
  }, [filters.floorId, filters.companyId, filters.assigned])

  const createBulk = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!bulk.floorId) {
      setError('Please select a floor')
      return
    }
    
    const list = []
    for (let i = Number(bulk.start); i <= Number(bulk.end); i++) list.push({ slotNumber: String(i) })
    
    try { 
      await createParkingSlots({ floorId: bulk.floorId, slots: list })
      setBulk({ floorId: '', start: 1, end: 10 })
      await loadSlots() 
      setError('') // Clear error on success
    } catch (e) { 
      console.error('Bulk create error:', e)
      setError(e.message) 
    }
  }

  const assignSlot = async (e) => {
    e.preventDefault()
    setError('')
    setAssignLoading(true)
    
    try { 
      // Prepare the employee data - if any field is empty, set employee to null to unassign
      const hasEmployeeData = assign.employee.name.trim() || assign.employee.vehicleNumber.trim() || assign.employee.rfid.trim()
      
      const employeeData = hasEmployeeData ? {
        name: assign.employee.name.trim(),
        vehicleNumber: assign.employee.vehicleNumber.trim(),
        rfid: assign.employee.rfid.trim()
      } : null
      
      const response = await updateParkingSlot(assign.id, { employee: employeeData })
      
      // Reset the assignment form
      setAssign({ id: '', employee: { name: '', vehicleNumber: '', rfid: '' } })
      
      // Reload slots to get updated data
      await loadSlots()
      
      setError('') // Clear any previous errors
    } catch (e) { 
      console.error('Assign slot error:', e)
      setError(e.response?.data?.message || e.message || 'Failed to update slot assignment') 
    } finally {
      setAssignLoading(false)
    }
  }

  const remove = async (id) => { 
    if (!confirm('Delete slot?')) return
    setError('')
    
    try { 
      await deleteParkingSlot(id)
      await loadSlots()
      setError('') // Clear error on success
    } catch (e) { 
      console.error('Delete slot error:', e)
      setError(e.message) 
    } 
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Add safety checks to ensure arrays
  const slotsArray = Array.isArray(slots) ? slots : []
  const floorsArray = Array.isArray(floors) ? floors : []
  const companiesArray = Array.isArray(companies) ? companies : []

  const assignedSlots = slotsArray.filter(s => s.employee && s.employee !== null).length
  const availableSlots = slotsArray.filter(s => !s.employee || s.employee === null).length

  // Helper function to get floor name - improved to handle different data structures
  const getFloorName = (slot) => {
    // First check if slot has populated floor object
    if (slot.floor && slot.floor.floorNumber) {
      return `Floor ${slot.floor.floorNumber}`
    }
    
    // If not, try to find floor by floorId in the floors array
    if (slot.floorId && floorsArray.length > 0) {
      const floor = floorsArray.find(f => f._id === slot.floorId)
      if (floor) {
        return `Floor ${floor.floorNumber}`
      }
    }
    
    // Try to match floor by company (since company is populated but floor isn't)
    if (slot.company && slot.company._id && floorsArray.length > 0) {
      const floor = floorsArray.find(f => 
        f.company && f.company._id === slot.company._id ||
        f.companyId === slot.company._id
      )
      if (floor) {
        return `Floor ${floor.floorNumber}`
      }
    }
    
    // Check for different possible floorId field names
    const possibleFloorIdFields = ['floorId', 'floor_id', 'FloorId', 'floorID']
    for (const field of possibleFloorIdFields) {
      if (slot[field] && floorsArray.length > 0) {
        const floor = floorsArray.find(f => f._id === slot[field])
        if (floor) {
          return `Floor ${floor.floorNumber}`
        }
      }
    }
    
    // If slot has floorNumber directly
    if (slot.floorNumber) {
      return `Floor ${slot.floorNumber}`
    }
    
    // If slot has floor_number
    if (slot.floor_number) {
      return `Floor ${slot.floor_number}`
    }
    
    return 'Floor Not Found'
  }

  // Helper function to get company name - improved to handle different data structures
  const getCompanyName = (slot) => {
    // First check if slot has direct company reference
    if (slot.company && slot.company.name) {
      return slot.company.name
    }
    
    // Check if slot's floor has company
    if (slot.floor && slot.floor.company && slot.floor.company.name) {
      return slot.floor.company.name
    }
    
    // Try to find company by companyId in the companies array
    if (slot.companyId && companiesArray.length > 0) {
      const company = companiesArray.find(c => c._id === slot.companyId)
      if (company) {
        return company.name
      }
    }
    
    // If slot's floor has companyId, find by that
    if (slot.floor && slot.floor.companyId && companiesArray.length > 0) {
      const company = companiesArray.find(c => c._id === slot.floor.companyId)
      if (company) {
        return company.name
      }
    }
    
    return 'Not Assigned'
  }

  // Manual filter function to apply filters on frontend if backend filtering isn't working
  const getFilteredSlots = () => {
    let filtered = slotsArray

    if (filters.floorId) {
      filtered = filtered.filter(slot => {
        return slot.floorId === filters.floorId || 
               (slot.floor && slot.floor._id === filters.floorId)
      })
    }

    if (filters.companyId) {
      filtered = filtered.filter(slot => {
        return slot.companyId === filters.companyId ||
               (slot.company && slot.company._id === filters.companyId) ||
               (slot.floor && slot.floor.companyId === filters.companyId) ||
               (slot.floor && slot.floor.company && slot.floor.company._id === filters.companyId)
      })
    }

    if (filters.assigned !== '') {
      const isAssigned = filters.assigned === 'true'
      filtered = filtered.filter(slot => {
        const hasEmployee = slot.employee && slot.employee !== null
        return isAssigned ? hasEmployee : !hasEmployee
      })
    }

    return filtered
  }

  const filteredSlots = getFilteredSlots()

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Parking Slots</h1>
            <p className='text-gray-600 mt-1'>Manage individual parking slots and employee assignments</p>
          </div>
        </div>

        {/* Stats Cards - using filtered slots for accurate counts */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-lg bg-blue-100'>
                <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-2xl font-bold text-gray-900'>{filteredSlots.length}</p>
                <p className='text-sm text-gray-600'>Total Slots</p>
              </div>
            </div>
          </div>
          
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-lg bg-green-100'>
                <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-2xl font-bold text-gray-900'>
                  {filteredSlots.filter(s => !s.employee || s.employee === null).length}
                </p>
                <p className='text-sm text-gray-600'>Available</p>
              </div>
            </div>
          </div>
          
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-lg bg-purple-100'>
                <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-2xl font-bold text-gray-900'>
                  {filteredSlots.filter(s => s.employee && s.employee !== null).length}
                </p>
                <p className='text-sm text-gray-600'>Assigned</p>
              </div>
            </div>
          </div>
          
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-lg bg-orange-100'>
                <svg className='w-6 h-6 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-2xl font-bold text-gray-900'>
                  {filteredSlots.length > 0 ? Math.round((filteredSlots.filter(s => s.employee && s.employee !== null).length / filteredSlots.length) * 100) : 0}%
                </p>
                <p className='text-sm text-gray-600'>Utilization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Filter Slots</h3>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Floor</label>
              <select 
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500' 
                value={filters.floorId} 
                onChange={e => setFilters(v => ({ ...v, floorId: e.target.value }))}
              >
                <option value=''>All Floors</option>
                {floorsArray.map(f => (
                  <option key={f._id} value={f._id}>Floor {f.floorNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Company</label>
              <select 
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500' 
                value={filters.companyId} 
                onChange={e => setFilters(v => ({ ...v, companyId: e.target.value }))}
              >
                <option value=''>All Companies</option>
                {companiesArray.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
              <select 
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500' 
                value={filters.assigned} 
                onChange={e => setFilters(v => ({ ...v, assigned: e.target.value }))}
              >
                <option value=''>All Slots</option>
                <option value='true'>Assigned</option>
                <option value='false'>Available</option>
              </select>
            </div>
            <div className='flex items-end'>
              <Button 
                onClick={loadSlots}
                disabled={loading}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
          {filters.floorId || filters.companyId || filters.assigned ? (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-blue-700'>
                  Showing {filteredSlots.length} of {slotsArray.length} slots
                </span>
                <button
                  onClick={() => setFilters({ floorId: '', companyId: '', assigned: '' })}
                  className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Bulk Create */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Bulk Create Slots</h3>
          <form onSubmit={createBulk}>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Select Floor</label>
                <select 
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500' 
                  value={bulk.floorId} 
                  onChange={e => setBulk(v => ({ ...v, floorId: e.target.value }))} 
                  required
                >
                  <option value=''>Choose a floor</option>
                  {floorsArray.map(f => (
                    <option key={f._id} value={f._id}>Floor {f.floorNumber} ({f.company?.name || 'No Company'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Start Number</label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500'
                  value={bulk.start} 
                  onChange={e => setBulk(v => ({ ...v, start: e.target.value }))} 
                  placeholder='1'
                  min='1'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>End Number</label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500'
                  value={bulk.end} 
                  onChange={e => setBulk(v => ({ ...v, end: e.target.value }))} 
                  placeholder='10'
                  min='1'
                />
              </div>
              <div className='flex items-end'>
                <Button 
                  type='submit'
                  className='w-full bg-green-600 hover:bg-green-700 text-white'
                >
                  Create Slots
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <svg className='w-5 h-5 text-red-500 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span className='text-red-700 text-sm font-medium'>{error}</span>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        {assign.id && (
          <div className='bg-white rounded-lg p-6 shadow-sm border'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {assign.employee.name ? 'Edit Assignment' : 'Assign Employee'}
              </h3>
              <button
                onClick={() => setAssign({ id: '', employee: { name: '', vehicleNumber: '', rfid: '' } })}
                className='text-gray-400 hover:text-gray-600'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
              <p className='text-sm text-blue-700'>
                <strong>Tip:</strong> Leave all fields empty to unassign the slot. Fill in at least one field to assign/update employee information.
              </p>
            </div>
            
            <form onSubmit={assignSlot}>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Employee Name</label>
                  <input
                    type='text'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500'
                    value={assign.employee.name} 
                    onChange={e => setAssign(v => ({ ...v, employee: { ...v.employee, name: e.target.value } }))} 
                    placeholder='John Doe'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Vehicle Number</label>
                  <input
                    type='text'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500'
                    value={assign.employee.vehicleNumber} 
                    onChange={e => setAssign(v => ({ ...v, employee: { ...v.employee, vehicleNumber: e.target.value } }))} 
                    placeholder='ABC-1234'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>RFID Tag</label>
                  <input
                    type='text'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500'
                    value={assign.employee.rfid} 
                    onChange={e => setAssign(v => ({ ...v, employee: { ...v.employee, rfid: e.target.value } }))} 
                    placeholder='RFID123456'
                  />
                </div>
                <div className='flex items-end space-x-2'>
                  <Button 
                    type='submit'
                    disabled={assignLoading}
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    {assignLoading ? 'Saving...' : 'Save Assignment'}
                  </Button>
                  <Button 
                    type='button' 
                    onClick={() => setAssign({ id: '', employee: { name: '', vehicleNumber: '', rfid: '' } })}
                    disabled={assignLoading}
                    className='flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Slots Table */}
        <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Parking Slots ({filteredSlots.length} {filters.floorId || filters.companyId || filters.assigned ? `filtered / ${slotsArray.length} total` : 'total'})
            </h3>
          </div>
          
          {loading ? (
            <div className='p-8 text-center'>
              <div className='inline-flex items-center space-x-2'>
                <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-gray-600'>Loading slots...</span>
              </div>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className='p-8 text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                {slotsArray.length === 0 ? 'No parking slots found' : 'No slots match your filters'}
              </h3>
              <p className='text-gray-600'>
                {slotsArray.length === 0 
                  ? 'Create your first parking slots using the bulk creation form above.' 
                  : 'Try adjusting your filters to see more results.'}
              </p>
            </div>
          ) : (
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
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredSlots.map((slot, index) => (
                    <tr key={slot._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                            <span className='text-white font-semibold text-sm'>{slot.slotNumber}</span>
                          </div>
                          <div className='ml-3'>
                            <div className='text-sm font-medium text-gray-900'>Slot {slot.slotNumber}</div>
                            <div className='text-sm text-gray-500'>ID: {slot._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {getFloorName(slot)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {getCompanyName(slot)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {slot.employee?.name || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {slot.employee?.vehicleNumber || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {slot.employee?.rfid || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {slot.employee ? (
                          <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800'>
                            Assigned
                          </span>
                        ) : (
                          <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                            Available
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex items-center justify-end space-x-2'>
                          <Button
                            size="small"
                            onClick={() => setAssign({ 
                              id: slot._id, 
                              employee: slot.employee ? {
                                name: slot.employee.name || '',
                                vehicleNumber: slot.employee.vehicleNumber || '',
                                rfid: slot.employee.rfid || ''
                              } : { name: '', vehicleNumber: '', rfid: '' } 
                            })}
                            className='bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1'
                          >
                            {slot.employee ? 'Edit' : 'Assign'}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => remove(slot._id)}
                            className='bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1'
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}