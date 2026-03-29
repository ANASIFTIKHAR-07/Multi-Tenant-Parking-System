import React, { useEffect, useState } from 'react'
import { createFloor, deleteFloor, fetchFloors } from '../../services/adminApi.js'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'

export default function Floors() {
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ floorNumber: '', totalSlots: '' })

  const load = async () => {
    try {
      setLoading(true)
      const response = await fetchFloors()
      
      console.log('Floors API response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response || {}))
      
      // Handle different possible response structures
      const floorsData = Array.isArray(response) 
        ? response 
        : response?.data || response?.floors || response?.message || []
      
      console.log('Processed floors data:', floorsData)
      console.log('Is array:', Array.isArray(floorsData))
      
      setFloors(floorsData)
    } catch (e) {
      console.error('Load floors error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      await createFloor({ floorNumber: Number(form.floorNumber), totalSlots: Number(form.totalSlots) })
      setForm({ floorNumber: '', totalSlots: '' })
      await load()
    } catch (e) { setError(e.message) }
  }

  const remove = async (id) => { 
    if (!confirm('Delete floor?')) return; 
    try { await deleteFloor(id); await load() } catch (e) { setError(e.message) } 
  }

  // Add safety check to ensure floors is always an array
  const floorsArray = Array.isArray(floors) ? floors : []
  
  const totalSlots = floorsArray.reduce((sum, floor) => sum + (floor.totalSlots || 0), 0)
  const availableSlots = floorsArray.reduce((sum, floor) => sum + (floor.availableSlots || 0), 0)
  const occupiedSlots = totalSlots - availableSlots

  console.log('Render state - floors array:', floorsArray)
  console.log('Stats:', { totalSlots, availableSlots, occupiedSlots })

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className="space-y-1">
          <h1 className='text-3xl font-bold text-gray-900'>
            Parking Floors
          </h1>
          <p className='text-gray-600'>Manage parking floors and slot capacities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'>
          <div className='flex items-center justify-between'>
            <div className="space-y-2">
              <p className='text-blue-100 text-xs font-semibold uppercase tracking-wider'>Total Floors</p>
              <p className='text-4xl font-bold'>{floorsArray.length}</p>
            </div>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
              <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
              </svg>
            </div>
          </div>
        </div>
        
        <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'>
          <div className='flex items-center justify-between'>
            <div className="space-y-2">
              <p className='text-green-100 text-xs font-semibold uppercase tracking-wider'>Total Slots</p>
              <p className='text-4xl font-bold'>{totalSlots}</p>
            </div>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
              <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
              </svg>
            </div>
          </div>
        </div>
        
        <div className='bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'>
          <div className='flex items-center justify-between'>
            <div className="space-y-2">
              <p className='text-purple-100 text-xs font-semibold uppercase tracking-wider'>Available</p>
              <p className='text-4xl font-bold'>{availableSlots}</p>
            </div>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
              <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>
        
        <div className='bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'>
          <div className='flex items-center justify-between'>
            <div className="space-y-2">
              <p className='text-orange-100 text-xs font-semibold uppercase tracking-wider'>Occupied</p>
              <p className='text-4xl font-bold'>{occupiedSlots}</p>
            </div>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
              <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Create Floor Form */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6'>
        <h3 className='text-xl font-bold text-gray-900 mb-6'>
          Create New Floor
        </h3>
        <form onSubmit={submit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Input 
              label='Floor Number' 
              type='number'
              value={form.floorNumber} 
              onChange={e => setForm(v => ({ ...v, floorNumber: e.target.value }))} 
              required 
              placeholder='e.g., 1, 2, 3...'
              className="[&>input]:border-gray-200 [&>input]:rounded-xl [&>input]:py-3 [&>input]:px-4 [&>input]:text-base [&>input]:transition-all [&>input]:duration-200 [&>input]:focus:border-blue-500 [&>input]:focus:ring-2 [&>input]:focus:ring-blue-500/20 [&>input]:hover:border-gray-300 [&>label]:text-gray-700 [&>label]:font-semibold [&>label]:text-sm [&>label]:mb-2"
            />
            <Input 
              label='Total Slots' 
              type='number'
              value={form.totalSlots} 
              onChange={e => setForm(v => ({ ...v, totalSlots: e.target.value }))} 
              required 
              placeholder='e.g., 50, 100...'
              className="[&>input]:border-gray-200 [&>input]:rounded-xl [&>input]:py-3 [&>input]:px-4 [&>input]:text-base [&>input]:transition-all [&>input]:duration-200 [&>input]:focus:border-blue-500 [&>input]:focus:ring-2 [&>input]:focus:ring-blue-500/20 [&>input]:hover:border-gray-300 [&>label]:text-gray-700 [&>label]:font-semibold [&>label]:text-sm [&>label]:mb-2"
            />
            <div className='flex items-end'>
              <Button 
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0'
              >
                Create Floor
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3'>
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <span className='text-red-800 font-medium'>{error}</span>
        </div>
      )}

      {/* Floors Table */}
      {loading ? (
        <div className='bg-white rounded-2xl p-16 flex items-center justify-center shadow-lg border border-gray-200/50'>
          <div className='flex items-center space-x-3'>
            <div className='w-6 h-6 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin'></div>
            <span className='text-gray-700 font-medium'>Loading floors...</span>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
            <h3 className='text-lg font-bold text-gray-900'>
              Floor Directory ({floorsArray.length} floors)
            </h3>
          </div>
          
          {floorsArray.length === 0 ? (
            <div className='text-center py-16'>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>No floors found</h3>
              <p className='text-gray-600'>Get started by creating your first parking floor.</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className="bg-gray-50">
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Floor</th>
                    <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Total Slots</th>
                    <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Available</th>
                    <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Occupied</th>
                    <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Assigned Company</th>
                    <th className='px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {floorsArray.map((floor) => (
                    <tr 
                      key={floor._id} 
                      className='hover:bg-gray-50 transition-colors duration-150'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25'>
                            <span className='text-white font-bold'>{floor.floorNumber}</span>
                          </div>
                          <div>
                            <div className='font-bold text-gray-900'>Floor {floor.floorNumber}</div>
                            <div className='text-xs text-gray-500'>ID: {floor._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='font-semibold text-gray-900'>{floor.totalSlots || 0}</span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-700'>
                          {floor.availableSlots || 0}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-orange-100 text-orange-700'>
                          {(floor.totalSlots || 0) - (floor.availableSlots || 0)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {floor.assignedCompany ? (
                          <div>
                            <div className='font-semibold text-gray-900'>{floor.assignedCompany.name}</div>
                            <div className='text-sm text-gray-500'>{floor.assignedCompany.email}</div>
                          </div>
                        ) : (
                          <span className='inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600'>
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right'>
                        <Button
                          onClick={() => remove(floor._id)}
                          className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0'
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}