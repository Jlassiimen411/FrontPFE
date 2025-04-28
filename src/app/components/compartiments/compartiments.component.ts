import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { ChangeDetectorRef } from '@angular/core';
import { CiterneService } from 'src/app/services/citerne.service';

@Component({
  selector: 'app-compartiments',
  templateUrl: './compartiments.component.html',
  styleUrls: ['./compartiments.component.css']
})
export class CompartimentsComponent implements OnInit {
  citerneDetails: any = null; // ici on va stocker toutes les infos de la citerne récupérée

  citerneIdFromUrl: number | null = null;
  compartiments: any[] = [];
  nbCompartiments: number = 0;
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
    private citerrneService: CiterneService,
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
      this.getCompartiments();
     this.getCiterne(); // <<< === ajoute cet appel*/
    } else {
      console.log('DEBUG: ID non trouvé dans l\'URL');
    }
  }
  getCiterne(): void {
    if (this.citerneIdFromUrl) {
      this.citerrneService.getCiterne(this.citerneIdFromUrl).subscribe({
        next: (citerne) => {
          console.log('Détails de la citerne récupérés:', citerne);
          this.citerneDetails = citerne;
        },
        error: (err) => {
          console.error('Erreur récupération citerne:', err);
          alert('Erreur lors de la récupération des détails de la citerne.');
        }
      });
    }
  }
  

  getCompartiments(): void {
    if (this.citerneIdFromUrl) {
      console.log('DEBUG: appel API avec citerneId:', this.citerneIdFromUrl);
      this.compartimentService.getCompartimentsByCiterneId(this.citerneIdFromUrl).subscribe({
        next: data => {
          console.log('Données récupérées:', data);
          if (Array.isArray(data)) {
            this.compartiments = data;
          } else {
            console.error("Données inattendues:", data);
            this.compartiments = [];
          }
        },
        error: err => {
          console.error('Erreur récupération compartiments:', err);
          alert('Erreur lors de la récupération des compartiments. Veuillez vérifier le serveur.');
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
  
    // Vérification de la capacité du compartiment par rapport à la capacité de la citerne
    this.citerrneService.getCiterne(this.nouveauCompartiment.citerneId).subscribe({
      next: (citerne) => {
        if (this.nouveauCompartiment.capaciteMax > citerne.capaciteMax) {
          this.citerneDetails = citerne;
          alert('La capacité du compartiment ne doit pas dépasser la capacité de la citerne.');
          return;
        }
  
        // Vérification du nombre de compartiments déjà ajoutés
        this.compartimentService.getCompartimentsByCiterneId(this.nouveauCompartiment.citerneId).subscribe({
          next: (compartiments) => {
            if (compartiments.length >= citerne.nombreCompartimentsMax) {
              alert('Le nombre maximal de compartiments pour cette citerne a déjà été atteint.');
              return;
            }
  
            // Tout est OK, on peut ajouter
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
                alert('Erreur: la capacité des compartiments dépasse la capacité maximale de la citerne.');
              }
            });
          },
          error: (err) => {
            console.error('Erreur récupération compartiments:', err);
            alert('Erreur lors de la vérification des compartiments existants.');
          }
        });
  
      },
      error: (err) => {
        console.error('Erreur récupération citerne:', err);
        alert('Erreur lors de la récupération de la citerne.');
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
  
    this.compartimentService.addCompartiment(payload).subscribe({
      next: () => {
        alert('Compartiment ajouté avec succès.');
        this.getCompartiments(); // Mise à jour du nombre de compartiments
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur ajout compartiment:', error);
        alert('Erreur lors de l\'ajout: ' + (error.error?.message || error.message));
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
