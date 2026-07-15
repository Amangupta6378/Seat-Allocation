const roleFloorPreferences = {
  Engineer: [1, 2],
  Manager: [2, 3],
  Analyst: [3, 4],
  Lead: [1, 2],
  Director: [4, 5],
  Specialist: [2, 3],
  HR: [5, 6],
  Finance: [4, 5],
  Support: [3, 4]
};

function getPreferredFloors(role) {
  return roleFloorPreferences[role] || [1, 2, 3, 4, 5, 6];
}

function findBestSeat(availableSeats, preferredZone, role) {
  if (!availableSeats || availableSeats.length === 0) {
    return null;
  }

  const prioritized = availableSeats.filter((seat) => seat.status === 'Available');
  if (prioritized.length === 0) {
    return null;
  }

  const preferredFloors = getPreferredFloors(role);
  const sorted = [...prioritized].sort((a, b) => {
    const floorA = preferredFloors.indexOf(a.floor) === -1 ? preferredFloors.length : preferredFloors.indexOf(a.floor);
    const floorB = preferredFloors.indexOf(b.floor) === -1 ? preferredFloors.length : preferredFloors.indexOf(b.floor);
    if (floorA !== floorB) return floorA - floorB;
    if (preferredZone) {
      const zoneA = a.zone === preferredZone ? 0 : 1;
      const zoneB = b.zone === preferredZone ? 0 : 1;
      if (zoneA !== zoneB) return zoneA - zoneB;
    }
    if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
    if (a.bay !== b.bay) return a.bay - b.bay;
    return a.seatNumber - b.seatNumber;
  });

  return sorted[0];
}

function buildSeatSuggestionMessage(seat, preferredZone) {
  if (!seat) {
    return 'No available seats match the requested criteria.';
  }

  if (preferredZone && seat.zone !== preferredZone) {
    return `Suggested alternate zone ${seat.zone} on Floor ${seat.floor}, Bay ${seat.bay}, Seat ${seat.zone}${seat.bay}-${seat.seatNumber}.`;
  }

  return `Suggested seat on Floor ${seat.floor}, Zone ${seat.zone}, Bay ${seat.bay}, Seat ${seat.zone}${seat.bay}-${seat.seatNumber}.`;
}

module.exports = { findBestSeat, buildSeatSuggestionMessage };
