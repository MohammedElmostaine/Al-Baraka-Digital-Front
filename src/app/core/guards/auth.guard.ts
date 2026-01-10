// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié
  if (authService.isAuthenticated()) {
    return true;
  }

  // Sauvegarder l'URL tentée pour redirection après connexion
  const returnUrl = state.url;

  // Rediriger vers la page de connexion
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl }
  });

  return false;
};
