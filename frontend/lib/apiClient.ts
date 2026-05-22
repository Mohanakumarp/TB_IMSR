// lib/apiClient.ts
import { supabase } from './supabase';

/**
 * API wrapper that automatically fetches the current Supabase access token
 * and attaches it to the Authorization header.
 * 
 * This ensures every API call to the backend uses a fresh, non-expired token.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get the current session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Failed to get session: ${sessionError.message}`);
    }

    const session = sessionData.session;
    
    if (!session) {
      throw new Error('No active session found. User may need to log in again.');
    }

    // Get the fresh access token (Supabase auto-refreshes if needed)
    const accessToken = session.access_token;

    // Merge headers with the Authorization bearer token
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    // Execute the fetch with the token-injected headers
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    console.error('apiFetch error:', error);
    throw error;
  }
}

/**
 * Convenience wrapper for GET requests with auth
 */
export async function apiGet(url: string) {
  return apiFetch(url, { method: 'GET' });
}

/**
 * Convenience wrapper for POST requests with auth
 */
export async function apiPost(url: string, body?: any) {
  return apiFetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for PUT requests with auth
 */
export async function apiPut(url: string, body?: any) {
  return apiFetch(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for DELETE requests with auth
 */
export async function apiDelete(url: string) {
  return apiFetch(url, { method: 'DELETE' });
}
