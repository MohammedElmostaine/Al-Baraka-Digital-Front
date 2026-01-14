import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Initialize the form immediately in the constructor, not in ngOnInit
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl = '';
  showPassword = false;

  ngOnInit(): void {
    // Si déjà connecté, rediriger vers le dashboard
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToDashboard();
      return;
    }

    // Récupérer l'URL de retour
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Getter pour accéder facilement aux champs du formulaire
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle visibility du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Remplir le formulaire avec un compte de démo
   */
  fillDemoAccount(role: 'client' | 'agent' | 'admin'): void {
    switch (role) {
      case 'client':
        this.loginForm.patchValue({
          email: 'test@client.com',
          password: 'test123'
        });
        break;
      case 'agent':
        this.loginForm.patchValue({
          email: 'agent@albaraka.com',
          password: 'agent123'
        });
        break;
      case 'admin':
        this.loginForm.patchValue({
          email: 'admin@albaraka.com',
          password: 'admin123'
        });
        break;
    }
  }

  /**
   * Soumission du formulaire de connexion
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Vérifier la validité du formulaire
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // Log pour debugging
    console.log('Tentative de connexion avec:', this.loginForm.value);

    // Appeler le service d'authentification
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading = false;

        // Rediriger vers le dashboard approprié
        if (this.returnUrl && this.returnUrl !== '/') {
          this.router.navigate([this.returnUrl]);
        } else {
          this.authService.redirectToDashboard();
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;

        // Message d'erreur plus détaillé
        if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8080';
        } else {
          this.errorMessage = error.message || 'Email ou mot de passe incorrect';
        }
      },
      complete: () => {
        console.log('Login request completed');
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
