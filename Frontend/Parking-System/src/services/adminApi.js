import { http } from './http.js';

// Companies
export const fetchCompanies = () => http.get('/admin/companies');
export const createCompany = (payload) => http.post('/admin/companies', payload);
export const updateCompany = (id, payload) => http.put(`/admin/companies/${id}`, payload);
export const deleteCompany = (id) => http.del(`/admin/companies/${id}`);
export const assignCompanyToFloor = (payload) => http.put('/admin/companies/assign-floor', payload);

// Floors
export const fetchFloors = () => http.get('/admin/floors');
export const createFloor = (payload) => http.post('/admin/floor', payload);
export const updateFloor = (id, payload) => http.put(`/admin/floor/${id}`, payload);
export const deleteFloor = (id) => http.del(`/admin/floor/${id}`);

// Parking Slots
export const createParkingSlots = (payload) => http.post('/admin/parking-slots', payload);
export const fetchParkingSlots = (query) => http.get('/admin/parking-slots', { query });
export const updateParkingSlot = (id, payload) => http.put(`/admin/parking-slot/${id}`, payload);
export const deleteParkingSlot = (id) => http.del(`/admin/parking-slot/${id}`);


// Logs
export const fetchParkingLogs = (query) => http.get('/admin/parking-logs', { query });

