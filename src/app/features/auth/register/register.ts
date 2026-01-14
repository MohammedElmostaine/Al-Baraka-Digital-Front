import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Initialize the form immediately, not in ngOnInit
  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  ngOnInit(): void {
    // Si déjà connecté, rediriger vers le dashboard
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToDashboard();
      return;
    }
  }

  // Getter pour accéder facilement aux champs du formulaire
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Validateur personnalisé pour vérifier que les mots de passe correspondent
   */
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Toggle visibility du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle visibility de la confirmation du mot de passe
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Soumission du formulaire d'inscription
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifier la validité du formulaire
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    // Préparer les données (sans confirmPassword)
    const { confirmPassword, ...registerData } = this.registerForm.value;

    // Appeler le service d'authentification
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Inscription réussie ! Redirection en cours...';

        // Rediriger vers le dashboard après 1 seconde
        setTimeout(() => {
          this.authService.redirectToDashboard();
        }, 1000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
