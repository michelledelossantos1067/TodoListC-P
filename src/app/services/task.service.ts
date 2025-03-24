import { Injectable } from '@angular/core';
import { ApiResponse, AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../model/task/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://localhost:7069/api/Tasks';
  
  constructor(private http: HttpClient, private authService: AuthService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  getAllTasks(): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(this.apiUrl, { headers: this.getHeaders() });
  }
  getTaskById(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  createTask(task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, task, { headers: this.getHeaders() });
  }  
  updateTask(id: number, task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, task, { headers: this.getHeaders() });
  }  
  deleteTask(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  searchTasks(query: string): Observable<ApiResponse<Task[]>> {
    let params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/search`, { 
      headers: this.getHeaders(),
      params: params
    });
  }
  
  filterTasks(
    status?: string, 
    priority?: number, 
    fromDate?: Date, 
    toDate?: Date
  ): Observable<ApiResponse<Task[]>> {
    let params = new HttpParams();
    
    if (status) {
      params = params.set('status', status);
    }
    
    if (priority) {
      params = params.set('priority', priority.toString());
    }
    
    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }
    
    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }
    
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/filter`, { 
      headers: this.getHeaders(),
      params: params
    });
  }
}