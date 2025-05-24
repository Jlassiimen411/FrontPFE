import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-admin',
  templateUrl: './gestion-admin.component.html',
  styleUrls: ['./gestion-admin.component.css']
})
export class GestionAdminComponent implements OnInit {

  alladmins: any = [];
  p: number = 1;  // Page courante pour la pagination

  constructor(
    private uService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.uService.getUsersByRole("Admin").subscribe(
      data => {
        console.log("Réponse reçue:", data);
        this.alladmins = data;
      },
      err => {
        console.error("Erreur lors du chargement des admins : ", err);
      }
    );
  }

  deleteAdmin(userName: string) {
    Swal.fire({
      title: '❗ Confirmation',
      text: `Voulez-vous vraiment supprimer "${userName}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.uService.deleteUser(userName).subscribe({
          next: (response) => {
            Swal.fire('✅ Supprimé', `L'utilisateur "${userName}" a été supprimé.`, 'success');
            this.loadAdmins(); // Rafraîchir la liste après suppression
          },
          error: (error) => {
            if (error.status === 200) {
              Swal.fire('✅ Supprimé', `L'utilisateur "${userName}" a été supprimé.`, 'success');
              this.loadAdmins();
            } else {
              console.error('Erreur lors de la suppression : ', error);
              Swal.fire('❌ Erreur', error.error || 'Échec de la suppression', 'error');
            }
          }
        });
      }
    });
  }
}
