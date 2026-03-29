import React from 'react';
// Tailwind styles

const ParkingSlot = ({ 
  slot, 
  onSelect, 
  isSelected = false, 
  isOccupied = false,
  vehicleInfo = null 
}) => {
  const getSlotStatus = () => {
    if (isOccupied) return 'occupied';
    if (isSelected) return 'selected';
    return 'available';
  };

  const getSlotIcon = () => {
    if (isOccupied) return '🚗';
    return '🅿️';
  };

  const statusClasses = {
    available: 'border-gray-300 bg-white hover:border-blue-400',
    selected: 'border-blue-500 bg-blue-50',
    occupied: 'border-red-400 bg-red-50',
  };

  return (
    <div 
      className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${statusClasses[getSlotStatus()]}`}
      onClick={() => !isOccupied && onSelect?.(slot)}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getSlotIcon()}</div>
        <div className="flex flex-1 items-center justify-between">
          <div className="text-base font-semibold text-gray-800">{slot?.slotNumber || 'N/A'}</div>
          {isOccupied && vehicleInfo && (
            <div className="text-right text-sm text-gray-600">
              <div className="font-medium">{vehicleInfo.plateNumber}</div>
              <div>{vehicleInfo.entryTime}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingSlot;
