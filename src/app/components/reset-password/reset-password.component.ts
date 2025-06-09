import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  onSubmit() {
    this.message = '';
    if (this.resetForm.invalid || this.newPassword?.value !== this.confirmPassword?.value) {
      this.message = 'Les mots de passe ne correspondent pas ou sont invalides.';
      return;
    }

    this.isLoading = true;

    const payload = {
      token: this.token,
      newPassword: this.newPassword?.value
    };

    this.userService.resetPassword(payload).subscribe({
      next: () => {
        this.message = 'Mot de passe réinitialisé avec succès.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Échec de la réinitialisation. Vérifiez le lien.';
        this.isLoading = false;
      }
    });
  }
}
