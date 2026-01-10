import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USER_KEY = environment.userKey;

  /**
   * Sauvegarde les informations utilisateur
   */
  saveUser(user: AuthResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Récupère les informations utilisateur
   */
  getUser(): AuthResponse | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Supprime les informations utilisateur
   */
  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Vide tout le localStorage
   */
  clearStorage(): void {
    localStorage.clear();
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Récupère l'email de l'utilisateur
   */
  getUserEmail(): string | null {
    const user = this.getUser();
    return user ? user.email : null;
  }

  /**
   * Récupère le nom complet de l'utilisateur
   */
  getUserFullName(): string | null {
    const user = this.getUser();
    return user ? user.fullName : null;
  }

  /**
   * Récupère le numéro de compte
   */
  getAccountNumber(): string | null {
    const user = this.getUser();
    return user ? user.accountNumber : null;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }
}
