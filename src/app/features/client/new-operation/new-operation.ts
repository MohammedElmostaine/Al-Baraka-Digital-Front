// src/app/features/client/new-operation/new-operation.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OperationService } from '../services/operation.service';
import { OperationType } from '../../../core/models';

@Component({
  selector: 'app-new-operation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './new-operation.html',
  styleUrls: ['./new-operation.scss']
})
export class NewOperationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly operationService = inject(OperationService);
  private readonly router = inject(Router);

  operationForm!: FormGroup;
  loading = signal(false);
  submitted = signal(false);
  errorMessage = signal('');
  showDocumentAlert = signal(false);
  selectedType = signal<OperationType>(OperationType.DEPOSIT);

  // Enums pour le template
  readonly OperationType = OperationType;

  ngOnInit(): void {
    this.initForm();
    this.setupFormListeners();
  }

  /**
   * Initialise le formulaire
   */
  private initForm(): void {
    this.operationForm = this.fb.group({
      type: [OperationType.DEPOSIT, Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      destinationAccountNumber: ['']
    });
  }

  /**
   * Configure les listeners sur les changements du formulaire
   */
  private setupFormListeners(): void {
    // Écouter les changements de type
    this.operationForm.get('type')?.valueChanges.subscribe((type: OperationType) => {
      this.selectedType.set(type);
      this.updateDestinationValidation(type);
    });

    // Écouter les changements de montant
    this.operationForm.get('amount')?.valueChanges.subscribe((amount: number) => {
      this.showDocumentAlert.set(amount > 10000);
    });
  }

  /**
   * Met à jour la validation du champ destination selon le type
   */
  private updateDestinationValidation(type: OperationType): void {
    const destinationControl = this.operationForm.get('destinationAccountNumber');

    if (type === OperationType.TRANSFER) {
      destinationControl?.setValidators([Validators.required]);
    } else {
      destinationControl?.clearValidators();
    }

    destinationControl?.updateValueAndValidity();
  }

  /**
   * Getter pour accéder aux contrôles du formulaire
   */
  get f() {
    return this.operationForm.controls;
  }

  /**
   * Sélectionne un type d'opération
   */
  selectOperationType(type: OperationType): void {
    this.operationForm.patchValue({ type });
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.operationForm.invalid) {
      return;
    }

    this.loading.set(true);

    const formValue = this.operationForm.value;

    // Préparer la requête
    const request = {
      type: formValue.type,
      amount: parseFloat(formValue.amount),
      ...(formValue.type === OperationType.TRANSFER && {
        destinationAccountNumber: formValue.destinationAccountNumber
      })
    };

    this.operationService.createOperation(request).subscribe({
      next: (operation) => {
        console.log('Operation created:', operation);

        // Si document requis, rediriger vers la page de détails
        if (operation.requiresDocument) {
          this.router.navigate(['/client/operations', operation.id], {
            queryParams: { uploadRequired: true }
          });
        } else {
          // Sinon, retour au dashboard
          this.router.navigate(['/client/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error creating operation:', error);
        this.errorMessage.set(error.message || 'Erreur lors de la création de l\'opération');
        this.loading.set(false);
      }
    });
  }

  /**
   * Retourne le label du type d'opération
   */
  getTypeLabel(type: OperationType): string {
    switch (type) {
      case OperationType.DEPOSIT:
        return 'Dépôt';
      case OperationType.WITHDRAWAL:
        return 'Retrait';
      case OperationType.TRANSFER:
        return 'Virement';
    }
  }

  /**
   * Retourne l'icône du type d'opération
   */
  getTypeIcon(type: OperationType): string {
    switch (type) {
      case OperationType.DEPOSIT:
        return '💰';
      case OperationType.WITHDRAWAL:
        return '💸';
      case OperationType.TRANSFER:
        return '↔️';
    }
  }

  /**
   * Retourne la description du type d'opération
   */
  getTypeDescription(type: OperationType): string {
    switch (type) {
      case OperationType.DEPOSIT:
        return 'Ajouter des fonds';
      case OperationType.WITHDRAWAL:
        return 'Retirer des fonds';
      case OperationType.TRANSFER:
        return 'Transférer des fonds';
    }
  }
}
