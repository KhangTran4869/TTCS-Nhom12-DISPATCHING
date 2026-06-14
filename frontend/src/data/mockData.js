// ── Mock Users for Authentication ──
// Matches backend User model (email for login, role lowercase)
export const mockUsers = [
  { _id: '1', full_name: 'Sarah Johnson',   email: 'sarah@dispatch.io', phone: '(555) 100-1000', password: 'Admin123!',    role: 'manager',    status: 'active' },
  { _id: '2', full_name: 'Mike Chen',       email: 'mike@dispatch.io',  phone: '(555) 100-2000', password: 'Dispatch123!', role: 'dispatcher', status: 'active' },
  { _id: '3', full_name: 'James Rodriguez', email: 'james@dispatch.io', phone: '(555) 100-3000', password: 'Driver123!',   role: 'driver',     status: 'active' },
];

// ── Mock Drivers (matches backend GET /api/drivers with populated user_id) ──
export const mockDrivers = [
  { _id: '1', user_id: { full_name: 'James Rodriguez', email: 'james@dispatch.io', phone: '(555) 101-2001', status: 'active' },   license_number: 'DL-2024-001', license_type: 'C',  experience_years: 5,  current_status: 'available', rating: 4.8 },
  { _id: '2', user_id: { full_name: 'Linda Park',      email: 'linda@dispatch.io', phone: '(555) 101-2002', status: 'active' },   license_number: 'DL-2024-002', license_type: 'B2', experience_years: 3,  current_status: 'available', rating: 4.5 },
  { _id: '3', user_id: { full_name: 'Carlos Mendez',   email: 'carlos@dispatch.io', phone: '(555) 101-2003', status: 'inactive' }, license_number: 'DL-2024-003', license_type: 'D',  experience_years: 8,  current_status: 'off',       rating: 4.2 },
  { _id: '4', user_id: { full_name: 'Aisha Patel',     email: 'aisha@dispatch.io', phone: '(555) 101-2004', status: 'active' },   license_number: 'DL-2024-004', license_type: 'C',  experience_years: 4,  current_status: 'assigned',  rating: 4.9 },
  { _id: '5', user_id: { full_name: 'Tom Nguyen',      email: 'tom@dispatch.io',   phone: '(555) 101-2005', status: 'active' },   license_number: 'DL-2024-005', license_type: 'B2', experience_years: 2,  current_status: 'on_trip',   rating: 4.6 },
  { _id: '6', user_id: { full_name: 'Emily Davis',     email: 'emily@dispatch.io', phone: '(555) 101-2006', status: 'inactive' }, license_number: 'DL-2024-006', license_type: 'E',  experience_years: 10, current_status: 'off',       rating: 3.8 },
];

// ── Mock Vehicles (matches backend Vehicle model) ──
export const mockVehicles = [
  { _id: '1', plate_number: 'TRK-4501', vehicle_type: 'truck',     capacity: 5000,  status: 'available',   current_location: 'Warehouse A' },
  { _id: '2', plate_number: 'TRK-4502', vehicle_type: 'truck',     capacity: 4500,  status: 'available',   current_location: 'Warehouse B' },
  { _id: '3', plate_number: 'TRK-4503', vehicle_type: 'truck',     capacity: 6000,  status: 'maintenance', current_location: 'Service Center' },
  { _id: '4', plate_number: 'VAN-1101', vehicle_type: 'van',       capacity: 1500,  status: 'available',   current_location: 'Hub 1' },
  { _id: '5', plate_number: 'VAN-1102', vehicle_type: 'van',       capacity: 2000,  status: 'maintenance', current_location: 'Service Center' },
  { _id: '6', plate_number: 'TRK-4504', vehicle_type: 'container', capacity: 10000, status: 'in_use',      current_location: 'En route - Highway 5' },
  { _id: '7', plate_number: 'VAN-1103', vehicle_type: 'van',       capacity: 1800,  status: 'available',   current_location: 'Hub 2' },
];

// ── Existing emails for uniqueness checks ──
export const existingEmails = [
  'sarah@dispatch.io',
  'mike@dispatch.io',
  'james@dispatch.io',
  'test@example.com',
];
