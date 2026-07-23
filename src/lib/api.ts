const API_URL = process.env.NEXT_PUBLIC_API_URL || '/cms';

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
  roles?: any[];
  status?: string;
}

export interface UserCreationRequest {
  username: string;
  password?: string;
  dob: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface UserUpdateRequest {
  password?: string;
  fullName: string;
  email: string;
  dob: string;
  phone?: string;
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function fetchApi<T>(endpoint: string, options?: RequestInit, isRetry = false): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    // Handle Token Expiration (401 Unauthorized)
    if (response.status === 401 && !isRetry && token) {
      if (isRefreshing) {
        return new Promise<ApiResponse<T>>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              resolve(fetchApi<T>(endpoint, options, true));
            } else {
              reject(new ApiError('Phiên đăng nhập đã hết hạn', 401));
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.result?.token || refreshData.token;
          
          if (newToken) {
            if (typeof window !== 'undefined') {
              if (localStorage.getItem('token')) {
                localStorage.setItem('token', newToken);
              } else {
                sessionStorage.setItem('token', newToken);
              }
            }
            onRefreshed(newToken);
            return fetchApi<T>(endpoint, options, true);
          }
        }
      } catch (e) {
        console.error('Refresh token failed:', e);
      } finally {
        isRefreshing = false;
      }
      
      // If refresh failed, clear token and redirect to login
      onRefreshed('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new ApiError('Phiên đăng nhập đã hết hạn', 401);
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (!response.ok) {
        throw new ApiError('Lỗi phản hồi từ máy chủ', response.status);
      }
      throw new Error('Lỗi không xác định từ máy chủ');
    }
    
    if (data.code !== undefined && data.code !== 1000 && data.code !== 0) {
      throw new ApiError(data.message || 'API Error', data.code);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  content: T[];
}

export const userApi = {
  getUsers: (pageNo: number = 0, pageSize: number = 20) => fetchApi<PageResponse<User>>(`/users/pagination?pageNo=${pageNo}&pageSize=${pageSize}`),
  searchUsers: (params: { username?: string, fullName?: string, email?: string, pageNo?: number, pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params.username) query.append('username', params.username);
    if (params.fullName) query.append('fullName', params.fullName);
    if (params.email) query.append('email', params.email);
    if (params.pageNo !== undefined) query.append('pageNo', params.pageNo.toString());
    if (params.pageSize !== undefined) query.append('pageSize', params.pageSize.toString());
    return fetchApi<PageResponse<User>>(`/users/search?${query.toString()}`);
  },
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
