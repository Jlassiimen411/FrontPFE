import { Component, OnInit } from '@angular/core';
import { CamionService } from 'src/app/services/camion.service';
import { CiterneService } from 'src/app/services/citerne.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-camions',
  templateUrl: './camions.component.html',
  styleUrls: ['./camions.component.css']
})
export class CamionsComponent implements OnInit {
  camions: any[] = [];
  statuts: string[] = ['Disponible', 'En maintenance', 'En livraison', 'Hors service'];
  citernes: any[] = [];

  // Modifications ici : remplacer 'citerneId' par 'citerne' et ajouter un objet citerne avec un id
  nouveauCamion = {
    id: 0,
    marque: '',
    modele: '',
    immatriculation: '',
    kilometrage: 0,
    statut: 'Disponible',
    citerne: { id: null } // Modifié : 'citerne' au lieu de 'citerneId' avec un objet contenant l'ID
  };

  camionEnCours: any = null;

  constructor(
    private camionService: CamionService,
    private citerneService: CiterneService
  ) {}

  ngOnInit(): void {
    this.loadCiternes(); // Charger les citernes en premier
    setTimeout(() => {
      if (this.citernes.length > 0) {
        this.loadCamions(); // Charger les camions seulement après avoir vérifié les citernes
      }
    }, 500);
  }

  loadCamions(): void {
    this.camionService.getCamions().subscribe(
      (data) => {
        console.log('Camions:', data);
        console.log('Citernes:', this.citernes);
        
        // Ajout des informations complètes sur la citerne pour chaque camion
        this.camions = data.map(camion => {
          const citerneAssociee = this.citernes.find(c => c.id === camion.citerne?.id); 
          return { 
            ...camion, 
            citerne: citerneAssociee ? { reference: citerneAssociee.reference, capacite: citerneAssociee.capacite } : null 
          };
        });
      },
      (error) => {
        console.error('Erreur lors du chargement des camions:', error);
      }
    );
  }
  
  loadCiternes(): void {
    this.citerneService.getCiternes().subscribe(
      (data) => {
        this.citernes = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des citernes:', error);
      }
    );
  }

  isFormValid(): boolean {
    return !!(this.nouveauCamion.marque && this.nouveauCamion.modele && this.nouveauCamion.immatriculation &&
              this.nouveauCamion.kilometrage > 0 && this.nouveauCamion.statut && this.nouveauCamion.citerne.id != null);
  }

  ajouterCamion() {
    if (this.isFormValid()) {
      // Créer l'objet à envoyer, avec la structure requise dans Postman (citerne avec id)
      const camionData = {
        ...this.nouveauCamion,
        citerne: { id: this.nouveauCamion.citerne.id }
      };

      this.camionService.addCamion(camionData).subscribe(
        (data) => {
          const citerneAssociee = this.citernes.find(c => c.id === data.citerne.id);
          const camionAvecCiterne = { 
            ...data, 
            citerne: citerneAssociee ? { reference: citerneAssociee.reference, capacite: citerneAssociee.capacite } : null 
          };
          this.camions.push(camionAvecCiterne);

          // Réinitialiser le formulaire
          this.nouveauCamion = { id: 0, marque: '', modele: '', immatriculation: '', kilometrage: 0, statut: 'Disponible', citerne: { id: null } };
        },
        (error) => {
          console.error("Erreur lors de l'ajout du camion:", error);
        }
      );
    }
  }

  supprimerCamion(id: number) {
    const camion = this.camions.find(c => c.id === id);
    if (camion) {
      Swal.fire({
        title: `Êtes-vous sûr de vouloir supprimer ?`,
        text: `Camion: ${camion.marque} - ${camion.immatriculation}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.camionService.deleteCamion(id).subscribe(
            () => {
              this.camions = this.camions.filter(c => c.id !== id);
              Swal.fire({
                title: 'Supprimé !',
                text: 'Le camion a été supprimé avec succès.',
                icon: 'success',
                confirmButtonColor: '#28a745'
              });
            },
            (error) => {
              console.error("Erreur lors de la suppression du camion:", error);
              Swal.fire({
                title: 'Erreur !',
                text: "Une erreur s'est produite lors de la suppression.",
                icon: 'error',
                confirmButtonColor: '#d33'
              });
            }
          );
        }
      });
    } else {
      Swal.fire({
        title: 'Erreur !',
        text: "Camion introuvable.",
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  }

  sauvegarderModification() {
    if (!this.camionEnCours.marque || !this.camionEnCours.modele || !this.camionEnCours.immatriculation || this.camionEnCours.kilometrage <= 0) {
      alert('Veuillez remplir tous les champs valides.');
      return;
    }
  
    // Vérifier si une citerne est bien sélectionnée
    const citerneId = this.camionEnCours.citerne ? this.camionEnCours.citerne.id : null;
  
    const camionModifie = {
      ...this.camionEnCours,
      citerne: citerneId ? { id: citerneId } : null
    };
  
    this.camionService.updateCamion(camionModifie).subscribe(
      () => {
        this.loadCamions();
        this.closeModal();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du camion:', error);
        alert("Une erreur est survenue lors de la modification du camion.");
      }
    );
  }
  

  editCamion(id: number): void {
    this.camionService.getCamion(id).subscribe(data => {
      this.camionEnCours = data;
      console.log('Fetched camion:', this.camionEnCours);
      const modal = document.querySelector('.modal') as HTMLElement;
      if (modal) {
        modal.style.display = 'block'; // Display the modal after fetching the citerne
      }
    });
  }

  closeModal() {
    this.camionEnCours = null;
  }
}
