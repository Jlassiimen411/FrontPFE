import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommandeService } from 'src/app/services/commande.service';
import { AddCommandeComponent } from '../add-commande/add-commande.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  allCommandes: any = [];

  constructor(
    private cService: CommandeService,
    private router: Router,
    private dialog: MatDialog // Import MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }


loadCommandes(): void {
  this.cService.getAllCommandes().subscribe({
    next: (data) => {
      console.log('Commandes récupérées:', data); // Affiche toutes les commandes
      if (data.length > 0) {
        console.log('Exemple commande:', data[0]); // Affiche la première commande
      }
      this.allCommandes = data;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des commandes', err);
    },
  });
}


deleteCommandeById(id: number): void {
  Swal.fire({
    title: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
    text: `ID de la commande : ${id}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.cService.deleteCommandeById(id).subscribe({
        next: (data) => {
          console.log('Commande supprimée', data);
          Swal.fire({
            title: 'Supprimée !',
            text: 'La commande a été supprimée avec succès.',
            icon: 'success',
            confirmButtonColor: '#28a745'
          });
          this.loadCommandes();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la commande', err);
          Swal.fire({
            title: 'Erreur !',
            text: `Erreur lors de la suppression de la commande. Détails: ${err?.message || 'Inconnu'}`,
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  });
}

  

  goToEdit(id: number): void {
    this.router.navigate(['editcommande', id]);
  }

  // Fonction pour afficher le popup Add Food
  openAddCommandeDialog(): void {
    const dialogRef = this.dialog.open(AddCommandeComponent, {
     
      width: '600px', // Vous pouvez ajuster la largeur
      height:'750px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur
    });

    // Action après fermeture du modal
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCommandes(); // Recharger la liste après ajout
      }
    });
  }
}
