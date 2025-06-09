import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';  // ajuste le chemin selon ton projet

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  message: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  sendResetLink() {
    this.message = '';
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const emailValue = this.forgotPasswordForm.value.email;

    this.userService.sendResetLink(emailValue).subscribe({
      next: (response) => {
        this.message = response.message; // message dynamique du backend
        this.forgotPasswordForm.reset();
        this.isLoading = false;
      }
      ,
      error: (err) => {
        this.message = err.error?.message || 'Erreur lors de l’envoi. Vérifiez l’email.';
        this.isLoading = false;
      }
      
    });
  }
}
