import jwt from 'jsonwebtoken';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Store coordinator token locally (in production, use SecureStore)
let coordinatorToken: string | null = null;

/**
 * Set coordinator token (called after login)
 */
export const setCoordinatorToken = (token: string) => {
  coordinatorToken = token;
};

/**
 * Get stored coordinator token
 */
export const getCoordinatorToken = (): string | null => {
  return coordinatorToken;
};

/**
 * Clear coordinator token (on logout)
 */
export const clearCoordinatorToken = () => {
  coordinatorToken = null;
};

/**
 * Coordinator login
 */
export const coordinatorLogin = async (login_id: string, password: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/coordinator/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    setCoordinatorToken(data.token);
    return data;
  } catch (error) {
    console.error('Coordinator login error:', error);
    throw error;
  }
};

/**
 * Fetch all patients
 */
export const fetchPatients = async () => {
  try {
    const token = getCoordinatorToken();
    if (!token) throw new Error('No coordinator token');

    const response = await fetch(`${BACKEND_URL}/api/coordinator/patients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch patients');
    return await response.json();
  } catch (error) {
    console.error('Fetch patients error:', error);
    throw error;
  }
};

/**
 * Fetch all doctors
 */
export const fetchDoctors = async () => {
  try {
    const token = getCoordinatorToken();
    if (!token) throw new Error('No coordinator token');

    const response = await fetch(`${BACKEND_URL}/api/coordinator/doctors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch doctors');
    return await response.json();
  } catch (error) {
    console.error('Fetch doctors error:', error);
    throw error;
  }
};

/**
 * Fetch all appointments
 */
export const fetchAppointments = async () => {
  try {
    const token = getCoordinatorToken();
    if (!token) throw new Error('No coordinator token');

    const response = await fetch(`${BACKEND_URL}/api/coordinator/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch appointments');
    return await response.json();
  } catch (error) {
    console.error('Fetch appointments error:', error);
    throw error;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  opid: string,
  doctor_id: string,
  appointment_date: string,
  surgery_required: boolean = false,
  recommended_plan?: string
) => {
  try {
    const token = getCoordinatorToken();
    if (!token) throw new Error('No coordinator token');

    const response = await fetch(`${BACKEND_URL}/api/coordinator/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        opid,
        doctor_id,
        appointment_date,
        surgery_required,
        recommended_plan
      })
    });

    if (!response.ok) throw new Error('Failed to create appointment');
    return await response.json();
  } catch (error) {
    console.error('Create appointment error:', error);
    throw error;
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  appointment_id: string,
  status: string,
  recommended_plan?: string
) => {
  try {
    const token = getCoordinatorToken();
    if (!token) throw new Error('No coordinator token');

    const response = await fetch(`${BACKEND_URL}/api/coordinator/appointments/${appointment_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, recommended_plan })
    });

    if (!response.ok) throw new Error('Failed to update appointment');
    return await response.json();
  } catch (error) {
    console.error('Update appointment error:', error);
    throw error;
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (appointment_id: string) => {
  try {
    const token = getCoordinatorToken();
    if (!token) throw new Error('No coordinator token');

    const response = await fetch(`${BACKEND_URL}/api/coordinator/appointments/${appointment_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete appointment');
    return await response.json();
  } catch (error) {
    console.error('Delete appointment error:', error);
    throw error;
  }
};