import { Component, OnInit } from '@angular/core';
import { CamionService } from 'src/app/services/camion.service';
import { CiterneService } from 'src/app/services/citerne.service';

interface Compartiment {
  id: number;
  reference: string;
  capaciteMax: number | null;
  statut: string;
}

@Component({
  selector: 'app-citernes',
  templateUrl: './citernes.component.html',
  styleUrls: ['./citernes.component.css']
})
export class CiternesComponent implements OnInit {
  citernes: any[] = [];
  compartiments: Compartiment[] = [];
  nouvelleCiterne = {
    reference: '',
    capacite: null,
    compartiments: [] as Compartiment[],
  };
  citerneEnCours: any = null;
  isModalOpen: boolean = false;
  selectedCompartiments: number[] = []; 

  constructor(
    private citerneService: CiterneService,
    private camionService: CamionService
  ) {}

  ngOnInit(): void {
    this.getCiternes();
    this.getCompartiments();
  }

  // Fetch compartiments from backend
  getCompartiments(): void {
    this.citerneService.getCompartiments().subscribe(
      (data) => {
        console.log('Compartiments disponibles:', data);
        this.compartiments = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des compartiments:', error);
        alert('Erreur lors de la récupération des compartiments.');
      }
    );
  }

  // Fetch citernes from backend
  getCiternes(): void {
    this.citerneService.getCiternes().subscribe(
      (data) => {
        console.log('Citernes récupérées:', data);
        this.citernes = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des citernes:', error);
        alert('Erreur lors de la récupération des citernes.');
      }
    );
  }

  // Add a new citerne
// Add a new citerne
ajouterCiterne(): void {
  if (!this.nouvelleCiterne.reference || !this.nouvelleCiterne.capacite) {
    alert('Veuillez remplir tous les champs.');
    return;
  }

  // Map compartiments selected to just their IDs
  const compartimentsSelectionnes = this.nouvelleCiterne.compartiments.map((comp: Compartiment) => {
    return { id: comp.id };  // Use the ID of the existing compartiment
  });

  // Check if any selected compartiment is already associated with another citerne
  const compartimentsAlreadyUsed = compartimentsSelectionnes.filter((comp: { id: number }) => {
    return this.citernes.some(citerne => 
      citerne.compartiments.some((existingCompartiment: Compartiment) => existingCompartiment.id === comp.id)
    );
  });

  if (compartimentsAlreadyUsed.length > 0) {
    // Alert if any compartiment is already associated
    alert('Certains compartiments sont déjà associés à une autre citerne et ne peuvent pas être ajoutés.');
    return;
  }

  const citerneToSend = {
    reference: this.nouvelleCiterne.reference,
    capacite: this.nouvelleCiterne.capacite,
    compartiments: compartimentsSelectionnes  // Send only the IDs of the selected compartiments
  };

  console.log("Data to send:", { 
    reference: this.nouvelleCiterne.reference,
    capacite: this.nouvelleCiterne.capacite,
    compartiments: compartimentsSelectionnes
  });

  this.citerneService.addCiterne(citerneToSend).subscribe(
    (newCiterne) => {
      this.getCiternes();
      this.resetForm();
    },
    (error) => {
      console.error('Erreur lors de l\'ajout de la citerne:', error);
      alert('Erreur serveur: ' + error.error.message || 'Une erreur est survenue.');
    }
  );
}

  // Edit an existing citerne
  editCiterne(id: number): void {
    console.log('Editing citerne with ID:', id);
    this.citerneService.getCiterne(id).subscribe(
      (data) => {
        if (data && data.id) {
          this.citerneEnCours = data;
          this.selectedCompartiments = this.citerneEnCours.compartiments.map((comp: any) => comp.id);
          this.isModalOpen = true;
          console.log('Modal should be open:', this.isModalOpen);
        } else {
          alert('Citerne non trouvée');
        }
      },
      (error) => {
        console.error('Error fetching citerne:', error);
        alert('Erreur lors de la récupération de la citerne.');
      }
    );
  }
  
  

  // Save citerne modifications
  sauvegarderModification(): void {
    if (!this.citerneEnCours || !this.citerneEnCours.id) {
      alert('ID de la citerne invalide.');
      return;
    }
  
    if (!this.citerneEnCours.reference || !this.citerneEnCours.capacite) {
      alert('Veuillez remplir tous les champs valides.');
      return;
    }
  
    if (this.selectedCompartiments.length === 0) {
      alert('Veuillez sélectionner au moins un compartiment.');
      return;
    }
  
    const compartimentsSelectionnes = this.selectedCompartiments.map(id => ({ id }));
  
    const citerneToSend = {
      id: this.citerneEnCours.id, // Assure-toi d'envoyer l'ID
      reference: this.citerneEnCours.reference,
      capacite: this.citerneEnCours.capacite,
      compartiments: compartimentsSelectionnes
    };
  
    this.citerneService.updateCiterne(citerneToSend).subscribe(
      () => {
        this.getCiternes();  // Refresh the citernes list
        this.closeModal();    // Close the modal
      },
      (error) => {
        console.error('Erreur lors de la sauvegarde de la citerne:', error);
        alert('Une erreur est survenue lors de la modification de la citerne.');
      }
    );
  }
  


  // Delete a citerne
  supprimerCiterne(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette citerne ?')) {
      this.citerneService.deleteCiterne(id).subscribe(
        () => {
          this.getCiternes();
        },
        (error) => {
          console.error('Erreur lors de la suppression de la citerne:', error);
          alert('Une erreur est survenue lors de la suppression de la citerne.');
        }
      );
    }
  }

  // Reset the form
  resetForm(): void {
    this.nouvelleCiterne = {
      reference: '',
      capacite: null,
      compartiments: []
    };
  }

  // Close the modal
  closeModal(): void {
    this.isModalOpen = false; // Close the modal
  }
}