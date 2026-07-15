const test = require('node:test');
const assert = require('node:assert/strict');
const { generateAssistantResponse } = require('../src/utils/aiAssistant');

test('returns a seat location answer for the requested phrasing', () => {
  const employees = [{ name: 'Amit', project: 'Talos' }];
  const seats = [{ floor: 2, zone: 'B', bay: 4, seatNumber: 23, allocatedEmployee: 'Amit', status: 'Occupied' }];

  const response = generateAssistantResponse('Where is employee Amit seated?', employees[0], employees, seats);

  assert.equal(response.intent, 'seat-location');
  assert.match(response.answer, /Floor 2/);
  assert.match(response.answer, /Talos/);
});

test('returns available seat counts for floor queries', () => {
  const employees = [];
  const seats = [
    { floor: 3, zone: 'A', bay: 1, seatNumber: 1, status: 'Available' },
    { floor: 3, zone: 'A', bay: 2, seatNumber: 2, status: 'Occupied' }
  ];

  const response = generateAssistantResponse('Show available seats on Floor 3', null, employees, seats);

  assert.equal(response.intent, 'available-seats');
  assert.match(response.answer, /1 available seats/);
});
