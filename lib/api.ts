// API Client for CSEDU Digital Knowledge Platform
// Connects to Go API Server (Port 8080)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface User {
  user_id: string;
  email: string;
  name: string;
  role_tier: 'public' | 'member' | 'staff' | 'admin' | 'ai_admin';
  created_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface MediaItem {
  item_id: string;
  title: string;
  format: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  access_tier: 'public' | 'member' | 'staff' | 'restricted';
  created_by: string;
  upload_date: string;
  file_path: string | null;
}

export interface MediaMetadata {
  meta_id: string;
  item_id: string;
  tags: string[];
  abstract: string;
  keywords: string[];
  language: string;
}

export interface LibraryCatalogItem {
  item_id: string;
  title: string;
  author: string;
  isbn: string;
  format: string;
  status: 'available' | 'borrowed' | 'reserved';
  location: string;
  cover_image: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SearchParams {
  q?: string;
  page?: number;
  per_page?: number;
  format?: string;
  status?: string;
  access_tier?: string;
}

class APIClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthTokens> {
    return this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    return this.request<{ user: User; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Library Catalog endpoints
  async getLibraryCatalog(params: SearchParams = {}): Promise<PaginatedResponse<LibraryCatalogItem>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return this.request<PaginatedResponse<LibraryCatalogItem>>(`/library/catalog?${searchParams.toString()}`);
  }

  async getLibraryItem(itemId: string): Promise<LibraryCatalogItem> {
    return this.request<LibraryCatalogItem>(`/library/catalog/${itemId}`);
  }

  // Media endpoints
  async getMediaItems(params: SearchParams = {}): Promise<PaginatedResponse<MediaItem>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return this.request<PaginatedResponse<MediaItem>>(`/media?${searchParams.toString()}`);
  }

  async getMediaItem(itemId: string): Promise<MediaItem & { metadata: MediaMetadata }> {
    return this.request<MediaItem & { metadata: MediaMetadata }>(`/media/${itemId}`);
  }

  async uploadMedia(formData: FormData): Promise<MediaItem> {
    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async updateMediaMetadata(itemId: string, metadata: Partial<MediaMetadata>): Promise<MediaMetadata> {
    return this.request<MediaMetadata>(`/media/${itemId}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
    });
  }
}

export const apiClient = new APIClient();
