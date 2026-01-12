// src/app/features/admin/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, User, Role } from '../../../core/models';

export interface UserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Récupère tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.users}`;

    return this.http.get<ApiResponse<User[]>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Récupère un utilisateur par ID
   */
  getUserById(id: number): Observable<User> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.userById.replace('{id}', id.toString())}`;

    return this.http.get<ApiResponse<User>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Récupère les utilisateurs par rôle
   */
  getUsersByRole(role: Role): Observable<User[]> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.usersByRole.replace('{role}', role)}`;

    return this.http.get<ApiResponse<User[]>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(request: UserRequest): Observable<User> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.users}`;

    return this.http.post<ApiResponse<User>>(url, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(id: number, request: UserRequest): Observable<User> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.userById.replace('{id}', id.toString())}`;

    return this.http.put<ApiResponse<User>>(url, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: number): Observable<void> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.userById.replace('{id}', id.toString())}`;

    return this.http.delete<ApiResponse<void>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Active/Désactive un utilisateur
   */
  toggleUserStatus(id: number): Observable<User> {
    const url = `${this.API_URL}${environment.apiEndpoints.admin.toggleStatus.replace('{id}', id.toString())}`;

    return this.http.patch<ApiResponse<User>>(url, {}).pipe(
      map(response => response.data)
    );
  }
}
