function generateAssistantResponse(query, employeeContext, employees = [], seats = []) {
  const lowered = (query || '').toLowerCase();

  const findEmployeeByName = (name) => employees.find((item) => item.name.toLowerCase() === name.toLowerCase());
  const findSeatForEmployee = (employee) => seats.find((item) => item.allocatedEmployeeId?.toString() === employee?._id?.toString()) || seats.find((item) => item.allocatedEmployee && item.allocatedEmployee.toLowerCase() === (employee?.name || '').toLowerCase());

  if (lowered.includes('where is') && lowered.includes('seated')) {
    const targetName = (query.match(/where is (?:employee )?(.+?) seated/i)?.[1] || '').trim();
    const targetEmployee = findEmployeeByName(targetName) || employeeContext || null;
    const seat = findSeatForEmployee(targetEmployee);

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
    const projectMatch = query.match(/project\s+([a-z0-9_-]+)/i);
    const projectName = projectMatch?.[1];
    if (projectName) {
      const seatsForProject = seats.filter((seat) => seat.allocatedProject?.toLowerCase() === projectName.toLowerCase() && seat.status === 'Occupied');
      const employeesForProject = employees.filter((employee) => employee.project.toLowerCase() === projectName.toLowerCase());
      return {
        intent: 'project',
        answer: `Project ${projectName} has ${seatsForProject.length} occupied seats and ${employeesForProject.length} employees mapped to it.`
      };
    }

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

  if (lowered.includes('allocate') && lowered.includes('new employee')) {
    const available = seats.find((seat) => seat.status === 'Available');
    return {
      intent: 'allocate-seat',
      answer: available
        ? `The next available seat is on Floor ${available.floor}, Zone ${available.zone}, Bay ${available.bay}, Seat ${available.zone}${available.bay}-${available.seatNumber}.`
        : 'No available seats are currently open for allocation.'
    };
  }

  return {
    intent: 'fallback',
    answer: 'I can help find seat locations, project assignments, available seats, and team locations.'
  };
}

module.exports = { generateAssistantResponse };
