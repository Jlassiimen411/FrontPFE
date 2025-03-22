import { Component, OnInit } from '@angular/core';
import { CamionService } from 'src/app/services/camion.service';
import { CiterneService } from 'src/app/services/citerne.service';

@Component({
  selector: 'app-camions',
  templateUrl: './camions.component.html',
  styleUrls: ['./camions.component.css']
})
export class CamionsComponent implements OnInit {
  camions: any[] = [];
  statuts: string[] = ['Disponible', 'En maintenance', 'En livraison', 'Hors service'];
  citernes: any[] = [];

  nouveauCamion = {
    id: 0,
    marque: '',
    modele: '',
    immatriculation: '',
    kilometrage: 0,
    statut: 'Disponible',
    citerneId: null
  };

  camionEnCours: any = null;

  constructor(
    private camionService: CamionService,
    private citerneService: CiterneService
  ) {}

  ngOnInit(): void {
    this.loadCiternes(); // Charger les citernes en premier
    setTimeout(() => {
      this.loadCamions(); // Charger les camions après un léger délai
    }, 500); // Attendre 500ms pour s'assurer que les citernes sont bien chargées
  }
  

  loadCamions(): void {
    this.camionService.getCamions().subscribe(
      (data) => {
        console.log("Camions chargés :", data);
        console.log("Citernes disponibles :", this.citernes);
        this.camions = data.map(camion => {
          console.log(`Traitement du camion ID ${camion.id}, citerneId = ${camion.citerneId}`);
          const citerneAssociee = this.citernes.find(c => c.id === camion.citerneId);
          console.log(`Citerne trouvée pour le camion ${camion.id} :`, citerneAssociee);
          return {
            ...camion,
            citerne: citerneAssociee || null
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
        console.log("Citernes chargées :", this.citernes); // Vérification
      },
      (error) => {
        console.error('Erreur lors du chargement des citernes:', error);
      }
    );
  }
  
  

  isFormValid(): boolean {
    return !!(this.nouveauCamion.marque && this.nouveauCamion.modele && this.nouveauCamion.immatriculation &&
              this.nouveauCamion.kilometrage > 0 && this.nouveauCamion.statut && this.nouveauCamion.citerneId);
  }

 // Après l'ajout d'un camion, chargez à nouveau les camions pour vous assurer que la citerne est bien associée.
 ajouterCamion() {
  if (this.isFormValid()) {
    this.camionService.addCamion(this.nouveauCamion).subscribe(
      (data) => {
        // Vérifie que la citerneId est bien prise en compte
        const citerneAssociee = this.citernes.find(c => c.id === data.citerneId);
        console.log(`Ajouté: ID camion ${data.id}, citerneId: ${data.citerneId}, Citerne trouvée:`, citerneAssociee);

        const camionAvecCiterne = { ...data, citerne: citerneAssociee || null };
        this.camions.push(camionAvecCiterne); 

        this.nouveauCamion = { id: 0, marque: '', modele: '', immatriculation: '', kilometrage: 0, statut: 'Disponible', citerneId: null };
        this.loadCiternes();  
      },
      (error) => {
        console.error("Erreur lors de l'ajout du camion:", error);
      }
    );
  }
}


  supprimerCamion(id: number) {
    const camion = this.camions.find(c => c.id === id);
    if (!camion) {
      alert("Erreur: Camion introuvable !");
      return;
    }

    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer le camion ${camion.marque} - ${camion.immatriculation} ?`);

    if (confirmation) {
      this.camionService.deleteCamion(id).subscribe(
        () => {
          this.camions = this.camions.filter(c => c.id !== id);
          alert("Camion supprimé avec succès !");
        },
        (error) => {
          console.error("Erreur lors de la suppression du camion:", error);
          alert("Une erreur s'est produite lors de la suppression.");
        }
      );
    }
  }

  sauvegarderModification() {
    if (this.camionEnCours) {
      this.camionService.updateCamion(this.camionEnCours).subscribe(
        (data) => {
          const index = this.camions.findIndex(c => c.id === this.camionEnCours.id);
          if (index !== -1) {
            const citerneAssociee = this.citernes.find(c => c.id === data.citerneId);
            console.log(`Mise à jour: ID camion ${data.id}, citerneId: ${data.citerneId}, Citerne trouvée:`, citerneAssociee);
  
            this.camions[index] = { ...data, citerne: citerneAssociee || null };
          }
          this.closeModal();
          alert("Modifications sauvegardées avec succès !");
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du camion:', error);
          alert("Une erreur s'est produite lors de la mise à jour.");
        }
      );
    }
  }
  

  editCamion(id: number) {
    const camion = this.camions.find(c => c.id === id);
    if (camion) {
      this.camionEnCours = { ...camion };
      const modal = document.querySelector('.modal') as HTMLElement;
      if (modal) {
        modal.style.display = 'block';
      }
    }
  }

  closeModal() {
    this.camionEnCours = null;
    const modal = document.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }
}