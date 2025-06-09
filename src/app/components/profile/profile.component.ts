
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/model/user';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      userName: [{ value: '', disabled: true }],
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      userPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          userName: user.userName,
          userFirstName: user.userFirstName,
          userLastName: user.userLastName,
          email: user.email
        });
      },
      error: () => this.toastr.error('Erreur lors du chargement du profil')
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedUser: User = {
        ...this.profileForm.getRawValue(),
        roles: this.user?.roles || []
      };

      this.userService.updateUserProfile(updatedUser).subscribe({
        next: () => {
          this.toastr.success('Profil mis à jour avec succès !');
          this.profileForm.controls['userPassword'].setValue('');
        },
        error: () => this.toastr.error('Erreur lors de la mise à jour du profil')
      });
    }
  }
}

