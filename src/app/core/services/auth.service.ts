import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { TokenService } from './token.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  // BehaviorSubject pour gérer l'état d'authentification
  private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  public currentUser$: Observable<AuthResponse | null>;

  // Observable pour savoir si l'utilisateur est connecté
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private storageService: StorageService
  ) {
    // Initialiser avec les données du localStorage
    const user = this.storageService.getUser();
    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(
      this.tokenService.isTokenValid()
    );
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Récupère la valeur actuelle de l'utilisateur
   */
  get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Connexion
   */
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    const url = `${this.API_URL}${environment.apiEndpoints.auth.login}`;

    return this.http.post<ApiResponse<AuthResponse>>(url, loginRequest).pipe(
      map(response => response.data),
      tap(authResponse => {
        // Sauvegarder le token et les infos utilisateur
        this.tokenService.saveToken(authResponse.token);
        this.storageService.saveUser(authResponse);

        // Mettre à jour les observables
        this.currentUserSubject.next(authResponse);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Inscription
   */
  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    const url = `${this.API_URL}${environment.apiEndpoints.auth.register}`;

    return this.http.post<ApiResponse<AuthResponse>>(url, registerRequest).pipe(
      map(response => response.data),
      tap(authResponse => {
        // Sauvegarder le token et les infos utilisateur
        this.tokenService.saveToken(authResponse.token);
        this.storageService.saveUser(authResponse);

        // Mettre à jour les observables
        this.currentUserSubject.next(authResponse);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Supprimer le token et les infos utilisateur
    this.tokenService.removeToken();
    this.storageService.removeUser();

    // Mettre à jour les observables
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Rediriger vers la page de connexion
    this.router.navigate(['/auth/login']);
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  getUserRole(): string | null {
    return this.storageService.getUserRole();
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.storageService.hasRole(role);
  }

  /**
   * Redirige vers le dashboard approprié selon le rôle
   */
  redirectToDashboard(): void {
    const role = this.getUserRole();

    switch (role) {
      case 'CLIENT':
        this.router.navigate(['/client/dashboard']);
        break;
      case 'AGENT_BANCAIRE':
        this.router.navigate(['/agent/dashboard']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Rafraîchit les informations utilisateur depuis le token
   */
  refreshUserData(): void {
    if (this.isAuthenticated()) {
      const user = this.storageService.getUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }
}
