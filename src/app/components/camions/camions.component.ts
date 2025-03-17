import { Component, OnInit } from '@angular/core';
import { CamionService } from 'src/app/services/camion.service'; // Importer le service

@Component({
  selector: 'app-camions',
  templateUrl: './camions.component.html',
  styleUrls: ['./camions.component.css']
})
export class CamionsComponent implements OnInit {
  camions: any[] = []; // Liste des camions
  statuts: string[] = ['Disponible', 'En maintenance', 'En livraison', 'Hors service']; // Liste des statuts

  // Modèle du nouveau camion
  nouveauCamion = {
    id: 0,
    marque: '',
    modele: '',
    immatriculation: '',
    kilometrage: 0,
    statut: 'Disponible' // Valeur par défaut
  };

  // Modèle pour le camion en cours d'édition
  camionEnCours: any = null;

  constructor(private camionService: CamionService) {}

  ngOnInit(): void {
    // Charger les camions depuis la base de données au démarrage
    this.loadCamions();
  }

  // Charger les camions depuis le service
  loadCamions(): void {
    this.camionService.getCamions().subscribe(
      (data) => {
        this.camions = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des camions:', error);
      }
    );
  }

  // Ajouter un camion
  ajouterCamion() {
    if (this.nouveauCamion.marque && this.nouveauCamion.modele) {
      this.camionService.addCamion(this.nouveauCamion).subscribe(
        (data) => {
          this.camions.push(data); // Ajouter le camion à la liste locale
          this.nouveauCamion = { id: 0, marque: '', modele: '', immatriculation: '', kilometrage: 0, statut: 'Disponible' }; // Réinitialiser le formulaire
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du camion:', error);
        }
      );
    }
  }

  // Supprimer un camion
  supprimerCamion(id: number) {
    this.camionService.deleteCamion(id).subscribe(
      () => {
        this.camions = this.camions.filter(camion => camion.id !== id); // Supprimer le camion de la liste
      },
      (error) => {
        console.error('Erreur lors de la suppression du camion:', error);
      }
    );
  }

  // Sauvegarder les modifications du camion
  sauvegarderModification() {
    if (this.camionEnCours) {
      this.camionService.updateCamion(this.camionEnCours).subscribe(
        (data) => {
          const index = this.camions.findIndex(c => c.id === this.camionEnCours.id);
          if (index !== -1) {
            this.camions[index] = { ...this.camionEnCours }; // Mettre à jour le camion dans la liste
          }
          this.closeModal(); // Fermer la modale après la sauvegarde
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du camion:', error);
        }
      );
    }
  }

  // Afficher la modale d'édition
  editCamion(id: number) {
    const camion = this.camions.find(c => c.id === id);
    if (camion) {
      this.camionEnCours = { ...camion }; // Copie les données du camion pour les modifier
      const modal = document.querySelector('.modal') as HTMLElement;
      if (modal) {
        modal.style.display = 'block'; // Affiche la modale
      }
    }
  }

  // Fermer la modale
  closeModal() {
    this.camionEnCours = null; // Réinitialiser les données de l'édition
    const modal = document.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none'; // Cache la modale
    }
  }
}
