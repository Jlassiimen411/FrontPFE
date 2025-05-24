import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-gestion-dispatcheur',
  templateUrl: './gestion-dispatcheur.component.html',
  styleUrls: ['./gestion-dispatcheur.component.css']
})
export class GestionDispatcheurComponent implements OnInit{


  alldispatcheurs : any = [];
  
  constructor(
    private uService :UserService,
    private router:Router
  ) {}

  ngOnInit() {
    this.loadDispatcheurs();
  }
  loadDispatcheurs() {
    this.uService.getUsersByRole("Dispatcheur").subscribe(
      data => {
        console.log("Réponse reçue:", data);
        this.alldispatcheurs = data;
      },
      err => {
        console.error("Erreur lors du chargement des dispachers : ", err);
      }
    );
  }
   deleteDispatcheur(userName: string) {
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
              // Suppression réussie
              Swal.fire('✅ Supprimé', `L'utilisateur "${userName}" a été supprimé.`, 'success');
              this.loadDispatcheurs(); // Rafraîchir la liste
            },
            error: (error) => {
              // Si le status est 200, considérer que c'est OK malgré l'erreur (souvent un bug du backend)
              if (error.status === 200) {
                Swal.fire('✅ Supprimé', `L'utilisateur "${userName}" a été supprimé.`, 'success');
                this.loadDispatcheurs();
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

 
