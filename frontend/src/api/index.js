const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Yêu cầu thất bại');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (err.status) throw err;
    // Network error
    const error = new Error('Không thể kết nối server. Vui lòng kiểm tra backend đang chạy.');
    error.status = 0;
    throw error;
  }
}

// ── Auth ──
export const apiLogin = (body) =>
  request('/users/login', { method: 'POST', body: JSON.stringify(body) });

export const apiRegister = (body) =>
  request('/users/register', { method: 'POST', body: JSON.stringify(body) });

// ── Users ──
export const apiGetUsers = () => request('/users');
export const apiGetUserById = (id) => request(`/users/${id}`);

// ── Drivers ──
export const apiGetDrivers = () => request('/drivers');
export const apiGetDriverById = (id) => request(`/drivers/${id}`);
export const apiCreateDriver = (body) =>
  request('/drivers', { method: 'POST', body: JSON.stringify(body) });
export const apiUpdateDriver = (id, body) =>
  request(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const apiDeleteDriver = (id) =>
  request(`/drivers/${id}`, { method: 'DELETE' });

// ── Vehicles ──
export const apiGetVehicles = () => request('/vehicles');
export const apiGetVehicleById = (id) => request(`/vehicles/${id}`);
export const apiCreateVehicle = (body) =>
  request('/vehicles', { method: 'POST', body: JSON.stringify(body) });
export const apiUpdateVehicle = (id, body) =>
  request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const apiDeleteVehicle = (id) =>
  request(`/vehicles/${id}`, { method: 'DELETE' });

// ── Orders ──
export const apiGetOrders = () => request('/orders');
export const apiCreateOrder = (body) =>
  request('/orders', { method: 'POST', body: JSON.stringify(body) });
export const apiUpdateOrder = (id, body) =>
  request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const apiDeleteOrder = (id) =>
  request(`/orders/${id}`, { method: 'DELETE' });

// ── Dispatch Assignments ──
export const apiGetAssignments = () => request('/dispatch-assignments');
export const apiCreateAssignment = (body) =>
  request('/dispatch-assignments', { method: 'POST', body: JSON.stringify(body) });
export const apiUpdateAssignment = (id, body) =>
  request(`/dispatch-assignments/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const apiUpdateAssignmentStatus = (id, body) =>
  request(`/dispatch-assignments/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });

// ── Driver Locations ──
export const apiGetDriverLocations = () => request('/driver-locations');
export const apiCreateDriverLocation = (body) =>
  request('/driver-locations', { method: 'POST', body: JSON.stringify(body) });

// ── Incidents ──
export const apiGetIncidents = () => request('/incidents');
export const apiCreateIncident = (body) =>
  request('/incidents', { method: 'POST', body: JSON.stringify(body) });
export const apiUpdateIncident = (id, body) =>
  request(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// ── Dashboard ──
export const apiGetDashboardStats = () => request('/dashboard/stats');
