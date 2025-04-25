import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-compartiments',
  templateUrl: './compartiments.component.html',
  styleUrls: ['./compartiments.component.css']
})
export class CompartimentsComponent implements OnInit {

  citerneIdFromUrl: number | null = null;
  compartiments: any[] = [];
  citernes: any;
  nouveauCompartiment: any = {
    reference: '',
    capaciteMax: null,
    statut: '',
    citerneId: null,
    typeProduit: ''
  };
  
  compartimentEnCours: any = null;

  constructor(
    private compartimentService: CompartimentService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idFromUrl = this.route.snapshot.paramMap.get('idCiterne');
    console.log('DEBUG: idFromUrl =', idFromUrl);
    
    if (idFromUrl) {
      this.citerneIdFromUrl = +idFromUrl;
      this.nouveauCompartiment.citerneId = this.citerneIdFromUrl;
      this.getCompartiments(); // Appel de getCompartiments après avoir défini l'ID
    } else {
      console.log('DEBUG: ID non trouvé dans l\'URL');
    }
  }

  getCompartiments(): void {
    if (this.citerneIdFromUrl) {
      console.log('DEBUG: appel API avec citerneId:', this.citerneIdFromUrl);
      this.compartimentService.getCompartimentsByCiterneId(this.citerneIdFromUrl).subscribe({
        next: data => {
          console.log('Données récupérées:', data);
          // Vérifie si les données sont un tableau directement
          if (Array.isArray(data)) {
            this.compartiments = data;
          } else {
            console.error("Données inattendues:", data);
            this.compartiments = [];
          }
        },
        error: err => {
          console.error('Erreur récupération compartiments:', err);
          this.compartiments = [];
        }
      });
    } else {
      console.error('Aucun ID de citerne trouvé.');
    }
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
      isUnique = !this.compartiments.some(c => c.reference === code);
    }
    this.nouveauCompartiment.reference = code;
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
  
    if (!this.nouveauCompartiment.citerneId) {
      alert('Aucune citerne associée. ID manquant dans l\'URL.');
      return;
    }
  
    const validTypes = ['GAZ', 'CARBURANT', 'LUBRIFIANT'];
    if (!validTypes.includes(this.nouveauCompartiment.typeProduit)) {
      alert('Type de produit invalide. Les valeurs autorisées sont GAZ, CARBURANT, LUBRIFIANT.');
      return;
    }
  
    const payload = {
      reference: this.nouveauCompartiment.reference,
      capaciteMax: this.nouveauCompartiment.capaciteMax,
      statut: this.nouveauCompartiment.statut,
      typeProduit: this.nouveauCompartiment.typeProduit,
      citerne: {
        id: this.nouveauCompartiment.citerneId
      }
    };
  
    this.compartimentService.addCompartiment(payload).subscribe({
      next: () => {
        alert('Compartiment ajouté avec succès.');
        this.getCompartiments();
        this.resetForm();
        this.cdr.detectChanges();
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
      statut: '',
      citerneId: this.citerneIdFromUrl,
      typeProduit: ''
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
