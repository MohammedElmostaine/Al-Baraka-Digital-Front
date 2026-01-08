import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login')
            .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register')
            .then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Client routes
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/client/dashboard/dashboard')
            .then(m => m.ClientDashboardComponent)
      },
      {
        path:'new-operation',
        loadComponent: () =>
        import('./features/client/new-operation/new-operation')
        .then(m => m.NewOperationComponent)
      },
      {
        path:'operation-details/:id',
        loadComponent: () =>
        import('./features/client/operation-details/operation-details')
        .then(m => m.OperationDetailsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Agent routes
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['AGENT_BANCAIRE'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/agent/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'operation/:id',
        loadComponent: () =>
        import('./features/agent/operation-validation/operation-validation')
        .then(m => m.OperationValidationComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'user-management',
        loadComponent: () =>
        import('./features/admin/user-management/user-management')
        .then(m => m.UserManagementComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
