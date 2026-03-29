import React, { useEffect, useState } from 'react'
import { createCompany, deleteCompany, fetchCompanies, updateCompany, assignCompanyToFloor, fetchFloors } from '../../services/adminApi.js'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'
import Modal from '../../components/common/Modal.jsx'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [floors, setFloors] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [assignForm, setAssignForm] = useState({ companyId: '', floorId: '' })

  const load = async () => {
    try {
      setLoading(true)
      const [companiesResponse, floorsResponse] = await Promise.all([fetchCompanies(), fetchFloors()])
      
      console.log('Companies response:', companiesResponse)
      console.log('Companies response keys:', Object.keys(companiesResponse || {}))
      console.log('Companies response.data:', companiesResponse?.data)
      console.log('Companies response.message:', companiesResponse?.message)
      console.log('Floors response:', floorsResponse)
      console.log('Floors response keys:', Object.keys(floorsResponse || {}))
      console.log('Floors response.data:', floorsResponse?.data)
      console.log('Floors response.message:', floorsResponse?.message)
      
      // Handle different possible response structures
      const companiesData = Array.isArray(companiesResponse) 
        ? companiesResponse 
        : companiesResponse?.data || companiesResponse?.message || []
        
      const floorsData = Array.isArray(floorsResponse) 
        ? floorsResponse 
        : floorsResponse?.data || floorsResponse?.message || []
      
      setCompanies(companiesData)
      setFloors(floorsData)
      
      console.log('Set companies:', companiesData)
      console.log('Set floors:', floorsData)
      
      // Debug the structure of the first company if it exists
      if (companiesData && companiesData.length > 0) {
        console.log('First company structure:', companiesData[0])
        console.log('First company keys:', Object.keys(companiesData[0]))
        console.log('assignedFloors:', companiesData[0].assignedFloors)
        console.log('floor:', companiesData[0].floor)
      }
      
      // Debug the structure of the first company if it exists
      if (companiesData && companiesData.length > 0) {
        console.log('First company structure:', companiesData[0])
        console.log('First company keys:', Object.keys(companiesData[0]))
        console.log('assignedFloors:', companiesData[0].assignedFloors)
        console.log('floor:', companiesData[0].floor)
      }
    } catch (e) {
      console.error('Load error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createCompany(form)
      setForm({ name: '', email: '', phone: '' })
      setIsOpen(false)
      await load()
    } catch (e) { setError(e.message) }
  }

  const assign = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate the form data
    if (!assignForm.companyId || !assignForm.floorId) {
      setError('Please select both a company and a floor')
      return
    }
    
    try {
      console.log('=== ASSIGNMENT DEBUG ===')
      console.log('Raw assignForm:', assignForm)
      console.log('Company ID type:', typeof assignForm.companyId, 'Value:', assignForm.companyId)
      console.log('Floor ID type:', typeof assignForm.floorId, 'Value:', assignForm.floorId)
      
      // Ensure we're sending strings (MongoDB ObjectIds should be strings)
      const payload = {
        companyId: String(assignForm.companyId).trim(),
        floorId: String(assignForm.floorId).trim()
      }
      
      console.log('Cleaned payload:', payload)
      console.log('Available companies:', companiesArray.map(c => ({ id: c._id, name: c.name })))
      console.log('Available floors:', floorsArray.map(f => ({ id: f._id, floorNumber: f.floorNumber })))
      
      const result = await assignCompanyToFloor(payload)
      console.log('Assignment successful:', result)
      
      setAssignForm({ companyId: '', floorId: '' })
      await load()
    } catch (error) { 
      console.error('=== ASSIGNMENT ERROR ===')
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Full error object:', error)
      console.error('Error.response exists:', !!error.response)
      
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('Request was made but no response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }
      
      // Show a more helpful error message
      let errorMessage = 'Assignment failed'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this company?')) return
    try { await deleteCompany(id); await load() } catch (e) { setError(e.message) }
  }

  // Add safety checks for arrays
  const companiesArray = Array.isArray(companies) ? companies : []
  const floorsArray = Array.isArray(floors) ? floors : []

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden'>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 bg-opacity-20 rounded-full animate-bounce"></div>
        <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-purple-400 bg-opacity-30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-indigo-400 bg-opacity-40 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-200 to-indigo-200 opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className='relative z-10 p-8 space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className="space-y-2">
            <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent'>
              Companies
            </h1>
            <p className='text-slate-600 text-lg'>Manage company information and floor assignments</p>
          </div>
          <Button 
            onClick={() => setIsOpen(true)}
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 border-0'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
            </svg>
            <span>Add Company</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-3xl p-8 text-white shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div className="space-y-2">
                <p className='text-blue-100 text-sm font-medium uppercase tracking-wider'>Total Companies</p>
                <p className='text-4xl font-bold'>{companiesArray.length}</p>
              </div>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
              </div>
            </div>
          </div>
          
          <div className='backdrop-blur-xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 rounded-3xl p-8 text-white shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div className="space-y-2">
                <p className='text-green-100 text-sm font-medium uppercase tracking-wider'>Available Floors</p>
                <p className='text-4xl font-bold'>{floorsArray.length}</p>
              </div>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
                </svg>
              </div>
            </div>
          </div>
          
          <div className='backdrop-blur-xl bg-gradient-to-br from-purple-500/90 to-indigo-600/90 rounded-3xl p-8 text-white shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div className="space-y-2">
                <p className='text-purple-100 text-sm font-medium uppercase tracking-wider'>Assignments</p>
                <p className='text-4xl font-bold'>{companiesArray.filter(c => (c.assignedFloors && c.assignedFloors.length > 0) || c.floor).length}</p>
              </div>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-3xl p-6 flex items-center space-x-4 shadow-xl'>
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <span className='text-red-800 font-medium'>{error}</span>
          </div>
        )}

        {/* Companies Table */}
        {loading ? (
          <div className='backdrop-blur-xl bg-white/40 rounded-3xl p-16 flex items-center justify-center shadow-2xl border border-white/20'>
            <div className='flex items-center space-x-4'>
              <div className='w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin'></div>
              <span className='text-slate-700 text-lg font-medium'>Loading companies...</span>
            </div>
          </div>
        ) : (
          <div className='backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
            <div className='px-8 py-6 border-b border-white/20 bg-gradient-to-r from-slate-50/50 to-blue-50/50'>
              <h3 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent'>
                Company Directory
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                    <th className='px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider'>Company</th>
                    <th className='px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider'>Contact</th>
                    <th className='px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider'>Floor Assignment</th>
                    <th className='px-8 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companiesArray.map((company, index) => (
                    <tr 
                      key={company._id} 
                      className={`transition-all duration-200 hover:bg-white/60 border-b border-white/10 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}
                    >
                      <td className='px-8 py-6'>
                        <div className='flex items-center space-x-4'>
                          <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
                            <span className='text-white font-bold text-lg'>{company.name?.charAt(0) || 'C'}</span>
                          </div>
                          <div className="space-y-1">
                            <div className='text-lg font-bold text-slate-900'>{company.name}</div>
                            <div className='text-sm text-slate-500 font-medium'>ID: {company._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-8 py-6'>
                        <div className="space-y-1">
                          <div className='text-slate-900 font-medium'>{company.email}</div>
                          <div className='text-slate-600'>{company.phone}</div>
                        </div>
                      </td>
                      <td className='px-8 py-6'>
                        {company.assignedFloors && company.assignedFloors.length > 0 ? (
                          <div className="space-y-1">
                            {company.assignedFloors.map((floor, idx) => (
                              <span key={floor._id || idx} className='inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg mr-2 mb-1'>
                                Floor {floor.floorNumber || floor}
                              </span>
                            ))}
                          </div>
                        ) : company.floor ? (
                          <span className='inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'>
                            Floor {company.floor.floorNumber}
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg'>
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className='px-8 py-6'>
                        <div className='flex items-center justify-end space-x-3'>
                          <button
                            onClick={() => {
                              const currentFloorId = company.assignedFloors?.[0]?._id || company.assignedFloors?.[0] || company.floor?._id || '';
                              setAssignForm({ companyId: company._id, floorId: currentFloorId });
                            }}
                            className='px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105'
                          >
                            {(company.assignedFloors && company.assignedFloors.length > 0) || company.floor ? 'Reassign Floor' : 'Assign Floor'}
                          </button>
                          <button
                            onClick={() => remove(company._id)}
                            className='px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105'
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {companiesArray.length === 0 && !loading && (
                <div className='text-center py-16'>
                  <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className='w-10 h-10 text-slate-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                    </svg>
                  </div>
                  <h3 className='text-2xl font-bold text-slate-900 mb-2'>No companies found</h3>
                  <p className='text-slate-600 text-lg'>Get started by adding your first company.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floor Assignment Form */}
        {assignForm.companyId && (
          <div className='backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl border border-white/20 p-8'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent'>
                Assign Company to Floor
              </h3>
              <button
                onClick={() => setAssignForm({ companyId: '', floorId: '' })}
                className='w-10 h-10 rounded-2xl bg-slate-200/50 hover:bg-slate-300/50 flex items-center justify-center transition-all duration-200 text-slate-600 hover:text-slate-800'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <form onSubmit={assign} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="space-y-2">
                  <label className='block text-sm font-bold text-slate-700 uppercase tracking-wider'>Company</label>
                  <select 
                    value={assignForm.companyId} 
                    onChange={e => setAssignForm(v => ({ ...v, companyId: e.target.value }))} 
                    className='w-full rounded-2xl border-0 bg-white/60 backdrop-blur-sm px-4 py-3 text-slate-900 shadow-lg focus:ring-4 focus:ring-blue-500/30 transition-all duration-200'
                  >
                    {companiesArray.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className='block text-sm font-bold text-slate-700 uppercase tracking-wider'>Floor</label>
                  <select 
                    value={assignForm.floorId} 
                    onChange={e => setAssignForm(v => ({ ...v, floorId: e.target.value }))} 
                    className='w-full rounded-2xl border-0 bg-white/60 backdrop-blur-sm px-4 py-3 text-slate-900 shadow-lg focus:ring-4 focus:ring-blue-500/30 transition-all duration-200'
                  >
                    <option value=''>Select floor</option>
                    {floorsArray.map(f => <option key={f._id} value={f._id}>Floor {f.floorNumber}</option>)}
                  </select>
                </div>
              </div>
              <div className='flex justify-end space-x-4 pt-4'>
                <Button 
                  type='button' 
                  variant='outline' 
                  onClick={() => setAssignForm({ companyId: '', floorId: '' })}
                  className='px-6 py-3 rounded-2xl bg-slate-200/50 text-slate-700 hover:bg-slate-300/50 border-0 font-semibold transition-all duration-200'
                >
                  Cancel
                </Button>
                <Button 
                  type='submit'
                  className='px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0'
                >
                  Assign Floor
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Add Company Modal */}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title='Add New Company'>
          <form onSubmit={submit} className='space-y-6'>
            <div className='space-y-4'>
              <Input 
                label='Company Name' 
                value={form.name} 
                required 
                onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
                placeholder='Enter company name'
              />
              <Input 
                label='Email Address' 
                type='email' 
                value={form.email} 
                required 
                onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
                placeholder='company@example.com'
              />
              <Input 
                label='Phone Number' 
                value={form.phone} 
                required 
                onChange={e => setForm(v => ({ ...v, phone: e.target.value }))}
                placeholder='+1 (555) 123-4567'
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4 border-t border-gray-200'>
              <Button 
                variant='outline' 
                type='button' 
                onClick={() => setIsOpen(false)}
                className='px-6 py-2'
              >
                Cancel
              </Button>
              <Button 
                type='submit'
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2'
              >
                Create Company
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}