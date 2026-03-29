// controllers/csv.controller.js
import { ParkingSlot } from '../models/parkingSlot.model.js';
import { createObjectCsvStringifier } from 'csv-writer';

export const exportParkingLogs = async (req, res) => {
  try {
    const { companyId, floorId, assigned } = req.query;
    const filter = {};

    // Optional company filter
    if (companyId) filter.company = companyId;

    // Optional floor filter
    if (floorId) filter.floor = floorId;

    // Optional assignment filter
    if (assigned !== undefined) {
      filter.employee = assigned === "true" ? { $ne: null } : null;
    }

    const slots = await ParkingSlot.find(filter)
      .populate('floor', 'floorNumber')
      .populate('company', 'name')
      .sort({ 'floor.floorNumber': 1, slotNumber: 1 });

    // CSV setup
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'slotNumber', title: 'Slot Number' },
        { id: 'floor', title: 'Floor' },
        { id: 'company', title: 'Company' },
        { id: 'employeeName', title: 'Employee Name' },
        { id: 'vehicleNumber', title: 'Vehicle Number' },
        { id: 'rfid', title: 'RFID' },
        { id: 'assignedDate', title: 'Assigned Date' },
        { id: 'status', title: 'Status' },
      ],
    });

    const csvData = slots.map(slot => ({
      slotNumber: slot.slotNumber,
      floor: `Floor ${slot.floor?.floorNumber || 'N/A'}`,
      company: slot.company?.name || 'Unassigned',
      employeeName: slot.employee?.name || 'Available',
      vehicleNumber: slot.employee?.vehicleNumber || '',
      rfid: slot.employee?.rfid || '',
      assignedDate: slot.updatedAt?.toISOString().split('T')[0] || '',
      status: slot.employee ? 'Occupied' : 'Available',
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=parking_assignments.csv');

    res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to export parking assignments', error: err.message });
  }
};
