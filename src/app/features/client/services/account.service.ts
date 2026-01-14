// src/app/features/client/services/account.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Account } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Récupère les informations du compte du client connecté
   */
  getAccount(): Observable<Account> {
    const url = `${this.API_URL}${environment.apiEndpoints.client.account}`;

    return this.http.get<ApiResponse<Account>>(url).pipe(
      map(response => response.data)
    );
  }
}
