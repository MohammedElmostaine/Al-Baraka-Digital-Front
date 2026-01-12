// src/app/features/agent/operation-validation/operation-validation.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AgentService } from '../services/agent.service';
import { Operation, OperationStatus, OperationType } from '../../../core/models';

@Component({
  selector: 'app-operation-validation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './operation-validation.html',
  styleUrls: ['./operation-validation.scss']
})
export class OperationValidationComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals
  operation = signal<Operation | null>(null);
  loading = signal(true);
  error = signal('');
  processing = signal(false);
  documentUrl = signal<string>('');
  showCommentForm = signal(false);
  actionType = signal<'approve' | 'reject' | null>(null);

  // Form
  commentForm!: FormGroup;

  // Enums pour le template
  readonly OperationStatus = OperationStatus;
  readonly OperationType = OperationType;

  ngOnInit(): void {
    // Initialiser le formulaire de commentaire
    this.commentForm = this.fb.group({
      comment: ['']
    });

    // Récupérer l'ID depuis la route
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID d\'opération invalide');
      this.loading.set(false);
      return;
    }

    this.loadOperation(+id);
  }

  /**
   * Charge les détails de l'opération
   */
private loadOperation(id: number): void {
  this.loading.set(true);
  this.error.set('');

  this.agentService.getOperationById(id).subscribe({
    next: (operation) => {
      this.operation.set(operation);

      if (operation.hasDocument) {
        this.documentUrl.set(
          this.agentService.getOperationDocument(operation.id)
        );
      }

      this.loading.set(false);
    },
    error: (error) => {
      console.error('Error loading operation:', error);
      this.error.set(error.message || 'Erreur lors du chargement');
      this.loading.set(false);
    }
  });
}


  /**
   * Affiche le formulaire de commentaire
   */
  showComment(type: 'approve' | 'reject'): void {
    this.actionType.set(type);
    this.showCommentForm.set(true);
  }

  /**
   * Cache le formulaire de commentaire
   */
  cancelComment(): void {
    this.showCommentForm.set(false);
    this.actionType.set(null);
    this.commentForm.reset();
  }

  /**
   * Approuve l'opération
   */
  approveOperation(): void {
    const operation = this.operation();
    if (!operation) return;

    if (!confirm('Êtes-vous sûr de vouloir approuver cette opération ?')) {
      return;
    }

    this.processing.set(true);
    const comment = this.commentForm.get('comment')?.value || undefined;

    this.agentService.approveOperation(operation.id, comment).subscribe({
      next: () => {
        alert('Opération approuvée avec succès !');
        this.router.navigate(['/agent/dashboard']);
      },
      error: (error) => {
        console.error('Error approving operation:', error);
        alert('Erreur: ' + (error.message || 'Impossible d\'approuver l\'opération'));
        this.processing.set(false);
      }
    });
  }

  /**
   * Rejette l'opération
   */
  rejectOperation(): void {
    const operation = this.operation();
    if (!operation) return;

    if (!confirm('Êtes-vous sûr de vouloir rejeter cette opération ?')) {
      return;
    }

    this.processing.set(true);
    const comment = this.commentForm.get('comment')?.value || undefined;

    this.agentService.rejectOperation(operation.id, comment).subscribe({
      next: () => {
        alert('Opération rejetée.');
        this.router.navigate(['/agent/dashboard']);
      },
      error: (error) => {
        console.error('Error rejecting operation:', error);
        alert('Erreur: ' + (error.message || 'Impossible de rejeter l\'opération'));
        this.processing.set(false);
      }
    });
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
   * Retourne au dashboard
   */
  goBack(): void {
    this.router.navigate(['/agent/dashboard']);
  }
}
