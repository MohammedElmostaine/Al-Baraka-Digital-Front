// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Récupérer les rôles autorisés depuis la route
  const allowedRoles = route.data['roles'] as Array<string>;

  // Si aucun rôle n'est spécifié, autoriser l'accès
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Récupérer le rôle de l'utilisateur
  const userRole = authService.getUserRole();

  // Vérifier si l'utilisateur a un des rôles autorisés
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Rediriger vers la page appropriée selon le rôle
  console.warn('Access denied. User role:', userRole, 'Required roles:', allowedRoles);
  authService.redirectToDashboard();

  return false;
};
