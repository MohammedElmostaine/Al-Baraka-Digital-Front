// src/app/features/admin/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { User, Role } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  // Signals
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal('');

  // Computed stats
  totalUsers = computed(() => this.users().length);
  activeUsers = computed(() => this.users().filter(u => u.active).length);
  inactiveUsers = computed(() => this.users().filter(u => !u.active).length);

  clientsCount = computed(() =>
    this.users().filter(u => u.role === Role.CLIENT).length
  );
  agentsCount = computed(() =>
    this.users().filter(u => u.role === Role.AGENT_BANCAIRE).length
  );
  adminsCount = computed(() =>
    this.users().filter(u => u.role === Role.ADMIN).length
  );

  // Enums pour le template
  readonly Role = Role;

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Charge tous les utilisateurs
   */
  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set(error.message || 'Erreur lors du chargement des utilisateurs');
        this.loading.set(false);
      }
    });
  }

  /**
   * Retourne la classe CSS pour le badge de rôle
   */
  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case Role.CLIENT:
        return 'badge-primary';
      case Role.AGENT_BANCAIRE:
        return 'badge-warning';
      case Role.ADMIN:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Retourne le label du rôle
   */
  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.CLIENT:
        return 'Client';
      case Role.AGENT_BANCAIRE:
        return 'Agent';
      case Role.ADMIN:
        return 'Admin';
      default:
        return role;
    }
  }

  /**
   * Retourne l'icône du rôle
   */
  getRoleIcon(role: Role): string {
    switch (role) {
      case Role.CLIENT:
        return '👤';
      case Role.AGENT_BANCAIRE:
        return '🛡️';
      case Role.ADMIN:
        return '👑';
      default:
        return '•';
    }
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadUsers();
  }
}
