// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;

          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            break;

          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            // Déconnecter l'utilisateur si le token est invalide
            authService.logout();
            break;

          case 403:
            errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
            router.navigate(['/auth/login']);
            break;

          case 404:
            errorMessage = error.error?.message || 'Ressource introuvable';
            break;

          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;

          case 503:
            errorMessage = 'Service temporairement indisponible';
            break;

          default:
            errorMessage = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });

      // Retourner l'erreur avec le message formaté
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
