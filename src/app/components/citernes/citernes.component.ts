import { Component, OnInit } from '@angular/core';
import { CamionService } from 'src/app/services/camion.service';
import { CiterneService } from 'src/app/services/citerne.service';

@Component({
  selector: 'app-citernes',
  templateUrl: './citernes.component.html',
  styleUrls: ['./citernes.component.css']
})
export class CiternesComponent implements OnInit {

  citernes: any[] = [];
  camions: any[] = [];
  nouvelleCiterne: any = {
    reference: '',
    capacite: null,
    camionId: null // This should reference a Camion ID when adding
  };
  citerneEnCours: any = null;

  constructor(
    private citerneService: CiterneService,
    private camionService: CamionService
  ) {}

  ngOnInit(): void {
    this.getCiternes();
    this.getCamions();  // Fetch camions to show in the dropdown
  }

  // Fetch camions from the backend to populate the dropdown
  getCamions(): void {
    this.camionService.getCamions().subscribe(data => {
      console.log(data);  // Log the response to check if it's correct
      if (data && data.length > 0) {
        this.camions = data;
      } else {
        console.log('No camions found.');
      }
    }, error => {
      console.error('Error fetching camions:', error); // Log any errors
    });
  }

  // Fetch citernes from the backend
  getCiternes(): void {
    this.citerneService.getCiternes().subscribe(data => {
      this.citernes = data;
    });
  }

  // Add a new citerne
  ajouterCiterne(): void {
    if (!this.nouvelleCiterne.reference || !this.nouvelleCiterne.capacite) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    if (this.nouvelleCiterne.capacite <= 0) {
      alert('La capacité doit être un nombre positif.');
      return;
    }

    // Proceed with adding the citerne
    this.citerneService.addCiterne(this.nouvelleCiterne).subscribe(
      () => {
        this.getCiternes();
        this.resetForm();  // Reset form after adding
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de la citerne:', error);
        alert('Une erreur est survenue lors de l\'ajout de la citerne.');
      }
    );
  }

  editCiterne(id: number): void {
    this.citerneService.getCiterne(id).subscribe(data => {
      this.citerneEnCours = data;
      console.log('Fetched citerne:', this.citerneEnCours);
      const modal = document.querySelector('.modal') as HTMLElement;
      if (modal) {
        modal.style.display = 'block'; // Display the modal after fetching the citerne
      }
    });
  }
  
  

  // Save the modified citerne
  sauvegarderModification(): void {
    console.log('Saving citerne:', this.citerneEnCours);  // Check if the correct data is being saved
    if (!this.citerneEnCours.reference || !this.citerneEnCours.capacite || this.citerneEnCours.capacite <= 0) {
      alert('Veuillez remplir tous les champs valides.');
      return;
    }
  
    // Call the service to update the citerne
    this.citerneService.updateCiterne(this.citerneEnCours).subscribe(() => {
      this.getCiternes();
      this.closeModal();
    }, error => {
      console.error('Error while saving citerne:', error);
      alert('Une erreur est survenue lors de la modification de la citerne.');
    });
  }
  

  // Delete a citerne
  supprimerCiterne(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette citerne ?')) {
      this.citerneService.deleteCiterne(id).subscribe(() => {
        this.getCiternes(); // Refresh the list of citernes after deletion
      }, error => {
        console.error('Erreur lors de la suppression de la citerne:', error);
        alert('Une erreur est survenue lors de la suppression de la citerne.');
      });
    }
  }

  // Reset form for adding a new citerne
  resetForm(): void {
    this.nouvelleCiterne = {
      reference: '',
      capacite: null,
      camionId: null // Reset camionId as well
    };
  }

  // Close modal for editing citerne
  closeModal(): void {
    this.citerneEnCours = null;
  }
}