import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7069/api';
  
  constructor(private http: HttpClient) { }
  
  register(registerData: RegisterRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/Auth/register`, registerData);
  }
  login(loginData: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/Auth/login`, loginData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_id', response.data.userId.toString());
            localStorage.setItem('username', response.data.username);
          }
        })
      );
  }
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  getUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  }
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}