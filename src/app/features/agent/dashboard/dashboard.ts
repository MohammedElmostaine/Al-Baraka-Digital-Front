// src/app/features/agent/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgentService } from '../services/agent.service';
import { Operation } from '../../../core/models/operation.model';
import { OperationType } from '../../../core/models/OperationType.model';
import { OperationStatus } from '../../../core/models/OperationStatus.model';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private readonly agentService = inject(AgentService);

  // Signals
  operations = signal<Operation[]>([]);
  loading = signal(true);
  error = signal('');

  // Computed / Derived signals
  pendingCount = computed(() => this.operations().length);
  operationsWithDocument = computed(() =>
    this.operations().filter(op => op.hasDocument)
  );
  operationsWithoutDocument = computed(() =>
    this.operations().filter(op => !op.hasDocument)
  );

  // Enums pour template
  readonly OperationType = OperationType;

  ngOnInit(): void {
    this.loadPendingOperations();
  }

  /**
   * Charge les opérations en attente
   */
  loadPendingOperations(): void {
    this.loading.set(true);
    this.error.set('');

    this.agentService.getPendingOperations().subscribe({
      next: (ops) => {
        this.operations.set(ops);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending operations:', err);
        this.error.set(err.message || 'Erreur lors du chargement des opérations');
        this.loading.set(false);
      }
    });
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadPendingOperations();
  }

  /**
   * Retourne la classe CSS pour le badge de type
   */
  getTypeBadgeClass(type: OperationType): string {
    switch (type) {
      case OperationType.DEPOSIT:
        return 'badge-success';
      case OperationType.WITHDRAWAL:
        return 'badge-danger';
      case OperationType.TRANSFER:
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Retourne le label du type
   */
  getTypeLabel(type: OperationType): string {
    switch (type) {
      case OperationType.DEPOSIT:
        return '💰 Dépôt';
      case OperationType.WITHDRAWAL:
        return '💸 Retrait';
      case OperationType.TRANSFER:
        return '↔️ Virement';
      default:
        return type;
    }
  }

  /**
   * Retourne l'icône selon le document
   */
  getDocumentIcon(operation: Operation): string {
    return operation.hasDocument ? '✓' : '✗';
  }

  /**
   * Classe pour l'icône document
   */
  getDocumentIconClass(operation: Operation): string {
    return operation.hasDocument ? 'has-document' : 'no-document';
  }
}
