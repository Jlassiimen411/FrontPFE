import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-dialog-livraison-details',
  templateUrl: './dialog-livraison-details.component.html',
  styleUrls: ['./dialog-livraison-details.component.css']
})
export class DialogLivraisonDetailsComponent implements OnInit {
  livaisons: any[] = [];  // Initialisation de la propriété directement ici

  constructor(
    public dialogRef: MatDialogRef<DialogLivraisonDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private livraisonService: LivraisonService,
    private router: Router
  ) { }

  ngOnInit(): void {
  const livraisonId = this.data?.livraisonId;

  if (!livraisonId) {
    console.error('ID de livraison manquant.');
    this.dialogRef.close();
    return;
  }

  this.livraisonService.getLivraisonById(livraisonId).subscribe({
    next: (res) => {
      this.data = res;

      const camion = this.data.camion || {};
      const citerne = camion.citerne || {};

      this.data.citerne = {
        reference: citerne.reference || 'Non définie',
        capacite: citerne.capacite || 'Non définie',
        compartiment: citerne.compartiment || {
          reference: 'Non définie',
          capaciteMax: 'Non définie',
          statut: 'Non défini'
        }
      };

      this.data.marque = camion.marque || 'Non définie';
      this.data.immatriculation = camion.immatriculation || 'Non définie';
      this.data.codeCommande = this.data.commande?.codeCommande || 'Non définie';
      this.data.codeLivraison = this.data.codeLivraison || 'Non définie';
      this.data.statut = this.data.statut || 'Non défini';
      this.data.dateLivraison = this.data.dateLivraison || 'Non définie';
    },
    error: (err) => {
      console.error('Erreur lors du chargement des détails :', err);
      this.dialogRef.close();
    }
  });
}

  
  
  
  
  
  

  closeDialog(): void {
    // Retirer le focus du bouton ou de tout élément en focus
    const button = document.querySelector('button');
    if (button) {
      button.blur(); // Retirer le focus
    }
  
    // Appliquer aria-hidden à l'élément racine
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.setAttribute('aria-hidden', 'true');
    }
  
    // Fermer le dialogue
    this.dialogRef.close();
  }
  

  deleteLivraison(): void {
    const livraisonId = this.data?.livraisonId;
  
    if (!livraisonId || livraisonId === 'ID inconnu') {
      Swal.fire({
        title: 'Erreur !',
        text: 'ID de livraison invalide.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }
  
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer cette livraison ?',
      text: `ID de livraison : ${livraisonId}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.livraisonService.deleteLivraisonById(livraisonId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimée !',
              text: 'La livraison a été supprimée avec succès.',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.dialogRef.close({ deleted: true, livraisonId: livraisonId });
            this.removeLivraisonFromCalendar(livraisonId);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            const errorMessage = err?.message || 'Inconnu';
            Swal.fire({
              title: 'Erreur !',
              text: `Erreur lors de la suppression. Détails: ${errorMessage}`,
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }
  

  removeLivraisonFromCalendar(livraisonId: number): void {
    if (!this.data?.calendarApi) {
      console.error('API de calendrier non disponible!');
      return;
    }

    console.log('API de calendrier disponible. Tentative de suppression de l\'événement.');

    const event = this.data.calendarApi.getEventById(livraisonId);

    if (event) {
      event.remove();
      console.log(`Livraison avec ID ${livraisonId} supprimée du calendrier`);
    } else {
      console.error(`Événement avec ID ${livraisonId} non trouvé.`);
    }
  }

  

  editLivraison(): void {
    const livraisonId = this.data?.livraisonId;
    if (!livraisonId) {
      alert("L'ID de livraison est manquant pour l'édition.");
      return;
    }

    console.log("Modification de la livraison avec l'ID:", livraisonId);

    // Fermer le dialogue avant la redirection
    this.dialogRef.close();

    // Rediriger vers la page de modification de la livraison
    this.router.navigate(['/edit-livraison', livraisonId]);
  }
}
