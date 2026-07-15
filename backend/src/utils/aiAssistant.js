function generateAssistantResponse(query, employeeContext, employees = [], seats = []) {
  const lowered = (query || '').toLowerCase();

  if (lowered.includes('where is') && lowered.includes('seated')) {
    const targetName = (query.match(/where is (?:employee )?(.+?) seated/i)?.[1] || '').trim();
    const targetEmployee = employees.find((item) => item.name.toLowerCase() === targetName.toLowerCase()) || employeeContext || null;
    const seat = seats.find((item) => item.allocatedEmployee && item.allocatedEmployee.toLowerCase() === (targetEmployee?.name || '').toLowerCase());

    if (targetEmployee && seat) {
      return {
        intent: 'seat-location',
        answer: `${targetEmployee.name} is seated on Floor ${seat.floor}, Zone ${seat.zone}, Bay ${seat.bay}, Seat ${seat.zone}${seat.bay}-${seat.seatNumber}. He is assigned to Project ${targetEmployee.project}.`
      };
    }

    if (targetEmployee) {
      return {
        intent: 'seat-location',
        answer: `${targetEmployee.name} has no active seat allocation.`
      };
    }
  }

  if (lowered.includes('project')) {
    const targetEmployee = employeeContext || employees[0] || null;
    return {
      intent: 'project',
      answer: targetEmployee ? `${targetEmployee.name} is assigned to ${targetEmployee.project}.` : 'Employee not found.'
    };
  }

  if (lowered.includes('available seats')) {
    const floorMatch = lowered.match(/floor\s*(\d+)/);
    const floor = floorMatch ? Number(floorMatch[1]) : null;
    const available = seats.filter((seat) => seat.status === 'Available' && (!floor || seat.floor === floor));
    return {
      intent: 'available-seats',
      answer: `Found ${available.length} available seats${floor ? ` on Floor ${floor}` : ''}.`
    };
  }

  if (lowered.includes('team')) {
    const teamEmployees = employees.filter((item) => item.project === (employeeContext?.project || ''));
    return {
      intent: 'team-location',
      answer: teamEmployees.length > 0 ? `${teamEmployees.length} teammates are linked to ${employeeContext?.project || 'the current project'}.` : 'No team members found.'
    };
  }

  return {
    intent: 'fallback',
    answer: 'I can help find seat locations, project assignments, available seats, and team locations.'
  };
}

module.exports = { generateAssistantResponse };
