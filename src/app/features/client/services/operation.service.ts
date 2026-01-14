// src/app/features/client/services/operation.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Operation, OperationRequest } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Récupère toutes les opérations du client connecté
   */
  getOperations(): Observable<Operation[]> {
    const url = `${this.API_URL}${environment.apiEndpoints.client.operations}`;

    return this.http.get<ApiResponse<Operation[]>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Récupère une opération par son ID
   */
  getOperationById(id: number): Observable<Operation> {
    const url = `${this.API_URL}${environment.apiEndpoints.client.operations}/${id}`;

    return this.http.get<ApiResponse<Operation>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crée une nouvelle opération
   */
  createOperation(request: OperationRequest): Observable<Operation> {
    const url = `${this.API_URL}${environment.apiEndpoints.client.operations}`;

    return this.http.post<ApiResponse<Operation>>(url, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Upload un document justificatif pour une opération
   */
  uploadDocument(operationId: number, file: File): Observable<any> {
    const url = `${this.API_URL}${environment.apiEndpoints.client.operations}/${operationId}/document`;

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<string>>(url, formData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Télécharge un document
   */
  downloadDocument(documentId: number): Observable<Blob> {
    const url = `${this.API_URL}${environment.apiEndpoints.client.downloadDocument.replace('{id}', documentId.toString())}`;

    return this.http.get(url, { responseType: 'blob' });
  }
}
