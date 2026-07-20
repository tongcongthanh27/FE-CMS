const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface User {
  id: string; // Assuming id is string (UUID) or number
  username: string;
  fullName: string;
  email: string;
  dob: string;
  
  // UI mocked fields (not in API spec but needed for UI)
  phone?: string;
  department?: string;
  role?: string;
  status?: string;
}

export interface UserCreationRequest {
  username: string;
  password?: string;
  dob: string;
  fullName: string;
  email: string;
}

export interface UserUpdateRequest {
  password?: string;
  fullName: string;
  email: string;
  dob: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const userApi = {
  getUsers: () => fetchApi<User[]>('/users'),
  getUser: (id: string) => fetchApi<User>(`/users/${id}`),
  createUser: (data: UserCreationRequest) => fetchApi<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUser: (id: string, data: UserUpdateRequest) => fetchApi<void>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateUserStatus: (id: string, accountStatus: string) => fetchApi<void>(`/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ accountStatus })
  }),
  deleteUser: (id: string) => fetchApi<void>(`/users/${id}`, {
    method: 'DELETE'
  })
};
