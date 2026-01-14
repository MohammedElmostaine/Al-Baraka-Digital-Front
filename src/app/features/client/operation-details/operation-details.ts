// src/app/features/client/operation-details/operation-details.component.ts
import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { OperationService } from '../services/operation.service';
import { Operation, OperationStatus, OperationType } from '../../../core/models';

@Component({
  selector: 'app-operation-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './operation-details.html',
  styleUrls: ['./operation-details.scss']
})
export class OperationDetailsComponent implements OnInit {
  private readonly operationService = inject(OperationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signals
  operation = signal<Operation | null>(null);
  loading = signal(true);
  error = signal('');
  uploadingDocument = signal(false);
  uploadError = signal('');
  uploadSuccess = signal('');
  uploadRequired = signal(false);
  selectedFile = signal<File | null>(null);

  // Enums pour le template
  readonly OperationStatus = OperationStatus;
  readonly OperationType = OperationType;

  ngOnInit(): void {
    // Récupérer l'ID depuis la route
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID d\'opération invalide');
      this.loading.set(false);
      return;
    }

    // Vérifier si upload requis (depuis query params)
    this.uploadRequired.set(
      this.route.snapshot.queryParamMap.get('uploadRequired') === 'true'
    );

    this.loadOperation(+id);
  }

  /**
   * Charge les détails de l'opération
   */
  private loadOperation(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.operationService.getOperationById(id).subscribe({
      next: (operation) => {
        this.operation.set(operation);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading operation:', error);
        this.error.set(error.message || 'Erreur lors du chargement de l\'opération');
        this.loading.set(false);
      }
    });
  }

  /**
   * Gère la sélection d'un fichier
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validation du fichier
    if (!this.validateFile(file)) {
      return;
    }

    this.selectedFile.set(file);
    this.uploadError.set('');
  }

  /**
   * Valide le fichier sélectionné
   */
  private validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (file.size > maxSize) {
      this.uploadError.set('Le fichier ne doit pas dépasser 5MB');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      this.uploadError.set('Format non autorisé. Utilisez PDF, JPG ou PNG');
      return false;
    }

    return true;
  }

  /**
   * Upload le document
   */
  uploadDocument(): void {
    const file = this.selectedFile();
    const operation = this.operation();

    if (!file || !operation) {
      return;
    }

    this.uploadingDocument.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set('');

    this.operationService.uploadDocument(operation.id, file).subscribe({
      next: () => {
        this.uploadSuccess.set('Document uploadé avec succès!');
        this.uploadingDocument.set(false);
        this.selectedFile.set(null);

        // Recharger l'opération après 1 seconde
        setTimeout(() => {
          this.loadOperation(operation.id);
        }, 1000);
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.uploadError.set(error.message || 'Erreur lors de l\'upload du document');
        this.uploadingDocument.set(false);
      }
    });
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
   * Retourne l'icône du statut
   */
  getStatusIcon(status: OperationStatus): string {
    switch (status) {
      case OperationStatus.PENDING:
        return '⏳';
      case OperationStatus.APPROVED:
      case OperationStatus.COMPLETED:
        return '✅';
      case OperationStatus.REJECTED:
        return '❌';
      default:
        return '•';
    }
  }

  /**
   * Retourne la description du statut
   */
  getStatusDescription(status: OperationStatus): string {
    switch (status) {
      case OperationStatus.PENDING:
        return 'Opération en attente de validation';
      case OperationStatus.APPROVED:
        return 'Opération validée et exécutée avec succès';
      case OperationStatus.COMPLETED:
        return 'Opération complétée';
      case OperationStatus.REJECTED:
        return 'Cette opération n\'a pas été approuvée';
      default:
        return '';
    }
  }

  /**
   * Retourne au dashboard
   */
  goBack(): void {
    this.router.navigate(['/client/dashboard']);
  }
}
