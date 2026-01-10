import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  sub: string; // email
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = environment.tokenKey;

  /**
   * Sauvegarde le token dans le localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Récupère le token depuis le localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Supprime le token du localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Vérifie si un token existe
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Décode le token JWT et retourne le payload
   */
  decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Récupère l'email depuis le token
   */
  getEmail(): string | null {
    const payload = this.decodeToken();
    return payload ? payload.sub : null;
  }

  /**
   * Récupère le rôle depuis le token
   */
  getRole(): string | null {
    const payload = this.decodeToken();
    return payload ? payload.role : null;
  }

  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) {
      return true;
    }

    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
  }

  /**
   * Vérifie si le token est valide (existe et non expiré)
   */
  isTokenValid(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  /**
   * Récupère le temps restant avant expiration (en secondes)
   */
  getTimeUntilExpiration(): number {
    const payload = this.decodeToken();
    if (!payload) {
      return 0;
    }

    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    return Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / 1000));
  }
}
