// src/app/features/client/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../services/account.service';
import { OperationService } from '../services/operation.service';
import { Account, Operation, OperationStatus } from '../../../core/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class ClientDashboardComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly operationService = inject(OperationService);

  // Signals pour la gestion d'état (Angular 17+)
  account = signal<Account | null>(null);
  operations = signal<Operation[]>([]);
  loading = signal(true);
  error = signal('');

  // Stats calculées
  totalOperations = signal(0);
  pendingCount = signal(0);
  completedCount = signal(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Charge toutes les données du dashboard
   */
  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set('');

    // Charger le compte
    this.accountService.getAccount().subscribe({
      next: (account) => {
        this.account.set(account);
      },
      error: (error) => {
        console.error('Error loading account:', error);
        this.error.set('Erreur lors du chargement du compte');
        this.loading.set(false);
      }
    });

    // Charger les opérations
    this.operationService.getOperations().subscribe({
      next: (operations) => {
        this.operations.set(operations);
        this.calculateStats(operations);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading operations:', error);
        this.error.set('Erreur lors du chargement des opérations');
        this.loading.set(false);
      }
    });
  }

  /**
   * Calcule les statistiques des opérations
   */
  private calculateStats(operations: Operation[]): void {
    this.totalOperations.set(operations.length);

    this.pendingCount.set(
      operations.filter(op => op.status === OperationStatus.PENDING).length
    );

    this.completedCount.set(
      operations.filter(op =>
        op.status === OperationStatus.COMPLETED ||
        op.status === OperationStatus.APPROVED
      ).length
    );
  }

  /**
   * Retourne la classe CSS pour le badge de statut
   */
  getStatusBadgeClass(status: OperationStatus): string {
    switch (status) {
      case OperationStatus.PENDING:
        return 'badge-warning';
      case OperationStatus.APPROVED:
      case OperationStatus.COMPLETED:
        return 'badge-success';
      case OperationStatus.REJECTED:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Retourne le label du statut
   */
  getStatusLabel(status: OperationStatus): string {
    switch (status) {
      case OperationStatus.PENDING:
        return 'En attente';
      case OperationStatus.APPROVED:
        return 'Approuvée';
      case OperationStatus.COMPLETED:
        return 'Complétée';
      case OperationStatus.REJECTED:
        return 'Rejetée';
      default:
        return status;
    }
  }

  /**
   * Retourne la classe CSS pour le badge de type
   */
  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return 'badge-success';
      case 'WITHDRAWAL':
        return 'badge-danger';
      case 'TRANSFER':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Retourne le label du type
   */
  getTypeLabel(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return '💰 Dépôt';
      case 'WITHDRAWAL':
        return '💸 Retrait';
      case 'TRANSFER':
        return '↔️ Virement';
      default:
        return type;
    }
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadDashboardData();
  }
}
