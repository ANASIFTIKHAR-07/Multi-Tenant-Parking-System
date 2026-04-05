import { http } from './http.js';

// Units
export const fetchUnits = (query) => http.get('/admin/units', { query });
export const createUnit = (payload) => http.post('/admin/units', payload);
export const updateUnit = (id, payload) => http.patch(`/admin/units/${id}`, payload);
export const deleteUnit = (id) => http.del(`/admin/units/${id}`);

// Tenants
export const fetchTenants = (query) => http.get('/admin/tenants', { query });
export const fetchTenantById = (id) => http.get(`/admin/tenants/${id}`);
export const createTenant = (payload) => http.post('/admin/tenants', payload);
export const updateTenant = (id, payload) => http.patch(`/admin/tenants/${id}`, payload);
export const deleteTenant = (id) => http.del(`/admin/tenants/${id}`);

// Employees
export const fetchEmployees = (query) => http.get('/admin/employees', { query });
export const fetchEmployeeById = (id) => http.get(`/admin/employees/${id}`);
export const createEmployee = (payload) => http.post('/admin/employees', payload);
export const updateEmployee = (id, payload) => http.patch(`/admin/employees/${id}`, payload);
export const deleteEmployee = (id) => http.del(`/admin/employees/${id}`);
export const addVehicle = (id, payload) => http.post(`/admin/employees/${id}/vehicles`, payload);
export const removeVehicle = (id, plateNumber) => http.del(`/admin/employees/${id}/vehicles/${plateNumber}`);

// Access Badges
export const fetchBadges = (query) => http.get('/admin/badges', { query });
export const fetchBadgeById = (id) => http.get(`/admin/badges/${id}`);
export const issueAccessBadge = (payload) => http.post('/admin/badges', payload);
export const deactivateBadge = (id, payload) => http.patch(`/admin/badges/${id}/deactivate`, payload);
export const fetchEmployeeBadgeHistory = (employeeId) => http.get(`/admin/badges/employee/${employeeId}/history`);

// Parking Records
export const fetchParkingRecords = (query) => http.get('/admin/parking', { query });
export const fetchParkingRecordById = (id) => http.get(`/admin/parking/${id}`);
export const createParkingRecord = (payload) => http.post('/admin/parking', payload);
export const cancelParkingRecord = (id, payload) => http.patch(`/admin/parking/${id}/cancel`, payload);

// Rental Contracts
export const fetchRentalContracts = (query) => http.get('/admin/rental-contracts', { query });
export const fetchRentalContractById = (id) => http.get(`/admin/rental-contracts/${id}`);
export const createRentalContract = (payload) => http.post('/admin/rental-contracts', payload);
export const updateRentalContract = (id, payload) => http.patch(`/admin/rental-contracts/${id}`, payload);
export const deleteRentalContract = (id) => http.del(`/admin/rental-contracts/${id}`);

// Visitor Cards
export const fetchVisitorCards = (query) => http.get('/admin/visitor-cards', { query });
export const fetchVisitorCardById = (id) => http.get(`/admin/visitor-cards/${id}`);
export const issueVisitorCard = (payload) => http.post('/admin/visitor-cards', payload);
export const checkInVisitor = (id) => http.patch(`/admin/visitor-cards/${id}/check-in`);
export const checkOutVisitor = (id) => http.patch(`/admin/visitor-cards/${id}/check-out`);
export const deactivateVisitorCard = (id, payload) => http.patch(`/admin/visitor-cards/${id}/deactivate`, payload);

// CSV Exports
export const exportParkingRecordsCSV = (query) => {
  const params = new URLSearchParams(query || {});
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/csv/parking-records?${params}`;
};
export const exportTenantsCSV = (query) => {
  const params = new URLSearchParams(query || {});
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/csv/tenants?${params}`;
};
export const exportBadgesCSV = (query) => {
  const params = new URLSearchParams(query || {});
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/csv/badges?${params}`;
};
export const exportRentalContractsCSV = (query) => {
  const params = new URLSearchParams(query || {});
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/csv/rental-contracts?${params}`;
};
