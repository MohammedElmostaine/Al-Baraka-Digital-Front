// src/app/features/agent/services/agent.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Operation } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Récupère toutes les opérations en attente (PENDING)
   */
  getPendingOperations(): Observable<Operation[]> {
    const url = `${this.API_URL}${environment.apiEndpoints.agent.pendingOperations}`;

    return this.http.get<ApiResponse<Operation[]>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Approuve une opération
   */
  approveOperation(operationId: number, comment?: string): Observable<Operation> {
    const url = `${this.API_URL}${environment.apiEndpoints.agent.approveOperation.replace('{id}', operationId.toString())}`;

    const body = comment ? { comment } : {};

    return this.http.put<ApiResponse<Operation>>(url, body).pipe(
      map(response => response.data)
    );
  }

  /**
   * Rejette une opération
   */
  rejectOperation(operationId: number, comment?: string): Observable<Operation> {
    const url = `${this.API_URL}${environment.apiEndpoints.agent.rejectOperation.replace('{id}', operationId.toString())}`;

    const body = comment ? { comment } : {};

    return this.http.put<ApiResponse<Operation>>(url, body).pipe(
      map(response => response.data)
    );
  }

getOperationById(operationId: number): Observable<Operation> {
  const url = `${this.API_URL}${environment.apiEndpoints.agent.getOperationById
    .replace('{id}', operationId.toString())}`;

  return this.http.get<ApiResponse<Operation>>(url).pipe(
    map(response => response.data)
  );
}


  /**
   * Récupère le document d'une opération
   */
  getOperationDocument(operationId: number): string {
    return `${this.API_URL}${environment.apiEndpoints.agent.operationDocument.replace('{id}', operationId.toString())}`;
  }
}
