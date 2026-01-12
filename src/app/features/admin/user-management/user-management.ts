// src/app/features/admin/user-management/user-management.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, UserRequest } from '../services/admin.service';
import { User, Role } from '../../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  // Signals
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedUser = signal<User | null>(null);
  processing = signal(false);
  filterRole = signal<Role | 'ALL'>('ALL');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  searchQuery = signal('');

  // Form
  userForm!: FormGroup;

  // Enums pour le template
  readonly Role = Role;
  readonly roles = [Role.CLIENT, Role.AGENT_BANCAIRE, Role.ADMIN];

  // Computed
  totalUsers = computed(() => this.filteredUsers().length);
  activeCount = computed(() => this.filteredUsers().filter(u => u.active).length);
  inactiveCount = computed(() => this.filteredUsers().filter(u => !u.active).length);

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  /**
   * Initialise le formulaire
   */
  private initForm(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      role: [Role.CLIENT, Validators.required],
      active: [true]
    });
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
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set(error.message || 'Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  /**
   * Applique les filtres
   */
  applyFilters(): void {
    let filtered = [...this.users()];

    // Filtre par rôle
    if (this.filterRole() !== 'ALL') {
      filtered = filtered.filter(u => u.role === this.filterRole());
    }

    // Filtre par statut
    if (this.filterStatus() === 'ACTIVE') {
      filtered = filtered.filter(u => u.active);
    } else if (this.filterStatus() === 'INACTIVE') {
      filtered = filtered.filter(u => !u.active);
    }

    // Recherche
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    this.filteredUsers.set(filtered);
  }

  /**
   * Change le filtre de rôle
   */
  setRoleFilter(role: Role | 'ALL'): void {
    this.filterRole.set(role);
    this.applyFilters();
  }

  /**
   * Change le filtre de statut
   */
  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  /**
   * Recherche
   */
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.applyFilters();
  }

  /**
   * Ouvre le modal de création
   */
  openCreateModal(): void {
    this.modalMode.set('create');
    this.selectedUser.set(null);
    this.userForm.reset({
      role: Role.CLIENT,
      active: true
    });
    // Reset password validator for create
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  /**
   * Ouvre le modal d'édition
   */
  openEditModal(user: User): void {
    this.modalMode.set('edit');
    this.selectedUser.set(user);
    this.userForm.patchValue({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      password: '' // Vide pour l'édition
    });
    // Make password optional for edit
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  /**
   * Ferme le modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.selectedUser.set(null);
    this.userForm.reset();
  }

  /**
   * Sauvegarde l'utilisateur
   */
  saveUser(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.processing.set(true);
    const formValue = this.userForm.value;

    // Pour l'édition, exclure le password s'il est vide
    const request: UserRequest = {
      email: formValue.email,
      password: formValue.password,
      fullName: formValue.fullName,
      role: formValue.role,
      active: formValue.active
    };

    if (this.modalMode() === 'create') {
      this.adminService.createUser(request).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          this.processing.set(false);
          alert('Utilisateur créé avec succès !');
        },
        error: (error) => {
          alert('Erreur: ' + (error.message || 'Impossible de créer l\'utilisateur'));
          this.processing.set(false);
        }
      });
    } else {
      const userId = this.selectedUser()!.id;
      this.adminService.updateUser(userId, request).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          this.processing.set(false);
          alert('Utilisateur mis à jour avec succès !');
        },
        error: (error) => {
          alert('Erreur: ' + (error.message || 'Impossible de mettre à jour l\'utilisateur'));
          this.processing.set(false);
        }
      });
    }
  }

  /**
   * Toggle le statut d'un utilisateur
   */
  toggleStatus(user: User): void {
    const action = user.active ? 'désactiver' : 'activer';

    if (!confirm(`Voulez-vous ${action} cet utilisateur ?`)) {
      return;
    }

    this.adminService.toggleUserStatus(user.id).subscribe({
      next: () => {
        this.loadUsers();
        alert('Statut mis à jour avec succès !');
      },
      error: (error) => {
        alert('Erreur: ' + (error.message || 'Impossible de modifier le statut'));
      }
    });
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(user: User): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.fullName} ?`)) {
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        alert('Utilisateur supprimé avec succès !');
      },
      error: (error) => {
        alert('Erreur: ' + (error.message || 'Impossible de supprimer l\'utilisateur'));
      }
    });
  }

  /**
   * Retourne la classe du badge de rôle
   */
  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case Role.CLIENT: return 'badge-primary';
      case Role.AGENT_BANCAIRE: return 'badge-warning';
      case Role.ADMIN: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  /**
   * Retourne le label du rôle
   */
  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.CLIENT: return 'Client';
      case Role.AGENT_BANCAIRE: return 'Agent';
      case Role.ADMIN: return 'Admin';
      default: return role;
    }
  }
}
