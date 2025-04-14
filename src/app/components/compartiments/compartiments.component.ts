import { Component, OnInit } from '@angular/core';
import { CompartimentService } from 'src/app/services/compartiment.service';

@Component({
  selector: 'app-compartiments',
  templateUrl: './compartiments.component.html',
  styleUrls: ['./compartiments.component.css']
})
export class CompartimentsComponent implements OnInit {

  compartiments: any[] = [];
  citernes: any[] = [];
  nouveauCompartiment: any = {
    reference: '',
    capaciteMax: null,
    statut: 'VIDE',
    // pas de champ "citerneId" ici
  };
  compartimentEnCours: any = null;

  constructor(private compartimentService: CompartimentService) {}

  ngOnInit(): void {
    this.getCompartiments();
    this.getCiternes(); // Même si les citernes ne sont plus nécessaires ici, vous pouvez les récupérer si nécessaire pour d'autres usages.
  }

  getCompartiments(): void {
    this.compartimentService.getCompartiments().subscribe({
      next: data => this.compartiments = data,
      error: error => {
        console.error('Erreur récupération compartiments:', error);
        alert('Erreur lors de la récupération des compartiments.');
      }
    });
  }
  genererCodeCompartiment(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    let isUnique = false;
    const prefix = 'COMP-';
  
    while (!isUnique) {
      code = prefix;
      for (let i = 0; i < 10; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
      }
  
      // Vérifie l'unicité par rapport aux références existantes
      isUnique = !this.compartiments.some(c => c.reference === code);
    }
  
    this.nouveauCompartiment.reference = code;
  }
  
  
  getCiternes(): void {
    this.compartimentService.getCiternes().subscribe({
      next: data => this.citernes = data,
      error: error => {
        console.error('Erreur récupération citernes:', error);
        alert('Erreur lors de la récupération des citernes.');
      }
    });
  }

  ajouterCompartiment(): void {
    if (!this.nouveauCompartiment.reference || !this.nouveauCompartiment.capaciteMax) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
  
    if (this.nouveauCompartiment.capaciteMax <= 0) {
      alert('La capacité doit être positive.');
      return;
    }
  
    const payload = {
      reference: this.nouveauCompartiment.reference,
      capaciteMax: this.nouveauCompartiment.capaciteMax,
      statut: this.nouveauCompartiment.statut,
    };
  
    this.compartimentService.addCompartiment(payload).subscribe({
      next: () => {
        alert('Compartiment ajouté avec succès.');
        this.getCompartiments();
        this.resetForm();
      },
      error: (error) => {
        console.error('Erreur ajout compartiment:', error);
        alert('Erreur lors de l\'ajout: ' + (error.error?.message || error.message));
      }
    });
  }
  

  editCompartiment(id: number): void {
    this.compartimentService.getCompartiment(id).subscribe({
      next: data => {
        // Suppression de la gestion de "citerne" ici
        this.compartimentEnCours = data;
      },
      error: error => {
        console.error('Erreur chargement compartiment:', error);
        alert('Erreur lors du chargement.');
      }
    });
  }

  sauvegarderModification(): void {
    if (!this.isFormValidEdit()) {
      alert('Veuillez remplir les champs valides.');
      return;
    }
  
    const payload = {
      id: this.compartimentEnCours.id,
      reference: this.compartimentEnCours.reference,
      capaciteMax: this.compartimentEnCours.capaciteMax,
      statut: this.compartimentEnCours.statut,
      // Ne pas inclure citerne ici
    };
  
    this.compartimentService.updateCompartiment(payload).subscribe({
      next: () => {
        alert('Modification enregistrée.');
        this.getCompartiments();
        this.closeModal();
      },
      error: error => {
        console.error('Erreur modification compartiment:', error);
        alert('Erreur lors de la modification.');
      }
    });
  }
  

  supprimerCompartiment(id: number): void {
    if (!confirm('Supprimer ce compartiment ?')) return;

    this.compartimentService.deleteCompartiment(id).subscribe({
      next: () => this.getCompartiments(),
      error: error => {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  resetForm(): void {
    this.nouveauCompartiment = {
      reference: '',
      capaciteMax: null,
      statut: 'VIDE',
    };
  }

  closeModal(): void {
    this.compartimentEnCours = null;
  }

  isFormValidEdit(): boolean {
    return this.compartimentEnCours &&
      this.compartimentEnCours.reference &&
      this.compartimentEnCours.capaciteMax > 0;
  }
}