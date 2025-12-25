// PHP API Configuration
// Update this URL to match your XAMPP setup
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/php-api/api';

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// User data management
const getStoredUser = () => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};
const setStoredUser = (user: any) => localStorage.setItem('auth_user', JSON.stringify(user));
const removeStoredUser = () => localStorage.removeItem('auth_user');

// Headers helper
const getHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// API response handler
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  
  return data;
};

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    
    if (data.access_token) {
      setToken(data.access_token);
      setStoredUser(data.user);
    }
    
    return data;
  },

  async register(email: string, password: string, fullName: string) {
    const response = await fetch(`${API_URL}/auth/register.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    
    const data = await handleResponse(response);
    
    if (data.access_token) {
      setToken(data.access_token);
      setStoredUser(data.user);
    }
    
    return data;
  },

  async me() {
    const response = await fetch(`${API_URL}/auth/me.php`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },

  logout() {
    removeToken();
    removeStoredUser();
  },

  getToken,
  getStoredUser,
  isAuthenticated: () => !!getToken(),
};

// Items API
export const itemsApi = {
  async getAll() {
    const response = await fetch(`${API_URL}/items/index.php`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/items/single.php?id=${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },

  async getByUser() {
    const response = await fetch(`${API_URL}/items/user.php`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },

  async create(itemData: {
    type: 'lost' | 'found';
    title: string;
    category: string;
    description?: string;
    location: string;
    date_occurred: string;
    image_url?: string;
  }) {
    const response = await fetch(`${API_URL}/items/index.php`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(itemData),
    });
    
    return handleResponse(response);
  },

  async update(id: string, updates: {
    title?: string;
    description?: string;
    location?: string;
    status?: string;
  }) {
    const response = await fetch(`${API_URL}/items/single.php?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/items/single.php?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },

  async generateQRCode(id: string) {
    const response = await fetch(`${API_URL}/items/qrcode.php`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ item_id: id }),
    });
    
    return handleResponse(response);
  },
};

// Matches API
export const matchesApi = {
  async getAll() {
    const response = await fetch(`${API_URL}/matches/index.php`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },
};

// Upload API
export const uploadApi = {
  async uploadImage(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/upload/image.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return handleResponse(response);
  },
};

export { getToken, setToken, removeToken, getStoredUser, setStoredUser, removeStoredUser };
