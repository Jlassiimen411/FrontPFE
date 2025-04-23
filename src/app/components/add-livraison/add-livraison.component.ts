import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';

import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, switchMap, map, catchError, of, first } from 'rxjs';
import { CompartimentService } from 'src/app/services/compartiment.service';

@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  referenceCiterne: string = ''; // pour stocker la référence de citerne saisie
  
  addLivraisonForm!: FormGroup;
  marquesCamion: string[] = [];
  immatriculations: string[] = [];
  commandes: any[] = [];
  camions: any[] = [];
  citernes: { id: number, reference: string, capacite: number }[] = [];
  compartiments: { reference: string, capaciteMax: number, statut: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    private compartimentService: CompartimentService,
    private camionService: CamionService,
   
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCommandes();
    this.loadMarquesCamions();
    
  }

  private initForm(): void {
    this.addLivraisonForm = this.fb.group({
      codeLivraison: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ], [this.codeLivraisonAsyncValidator()]],
      commandeId: [[], Validators.required],  // Changez ceci pour un tableau vide
      date: ['', Validators.required],
      statut: ['', Validators.required],
      marque: ['', Validators.required],
      immatriculation: ['', Validators.required],
      citerne: [{ value: '', disabled: true }, Validators.required]
    });
  }
  

  // Déplacer cette méthode ici
  private getCamionIdByImmatriculation(immatriculation: string): number | null {
    const camionTrouve = this.camions.find(c => c.immatriculation === immatriculation);
    return camionTrouve ? camionTrouve.id : null;
  }

  private codeLivraisonAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null); // ne pas valider si le champ est vide
      }
      return this.lService.checkCodeLivraisonExists(control.value).pipe(
        debounceTime(300),
        map(response => {
          return response.exists ? { codeLivraisonExists: true } : null;
        }),
        catchError(() => of(null)),
        first()
      );
    };
  }
  onCiterneSelectionChange(event: any): void {
    const citerneId = event.target.value;
    const citerne = this.citernes.find(c => c.id == citerneId);
    if (citerne) {
      this.referenceCiterne = citerne.reference;
      this.loadCompartimentsByCiterneReference();
    } else {
      this.compartiments = [];
    }
  }
  loadCompartimentsByCiterneReference(): void {
    if (!this.referenceCiterne) {
      this.compartiments = [];
      return;
    }
    
    this.compartimentService.getCompartimentsByCiterneReference(this.referenceCiterne)
      .subscribe({
        next: (data) => {
          this.compartiments = data;
          console.log('Compartiments récupérés:', this.compartiments);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des compartiments:', err);
          this.compartiments = [];
          this.snackBar.open("Erreur lors de la récupération des compartiments", 'Fermer', { duration: 3000 });
        }
      });
  }
  
  
  getCompartimentsByReference(): void {
    if (!this.referenceCiterne) {
      this.compartiments = [];
      return;
    }
  
    this.compartimentService.getCompartimentsByCiterneReference(this.referenceCiterne)
      .pipe(first())
      .subscribe({
        next: data => this.compartiments = data,
        error: () => {
          this.compartiments = [];
          this.snackBar.open("Erreur lors de la récupération des compartiments", 'Fermer', { duration: 3000 });
        }
      });
  }
  

  onImmatriculationSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const immatriculation = target.value;
    
    console.log('Immatriculation sélectionnée:', immatriculation);
    
    this.camionService.getCiterneByImmatriculation(immatriculation)
  .subscribe({
    next: (data) => {
      this.citernes = [{
        id: data.id,
        reference: data.reference,
        capacite: data.capacite
      }];

      // Utiliser setTimeout pour éviter l'erreur ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.addLivraisonForm.get('citerne')?.enable();
        this.addLivraisonForm.get('citerne')?.setValue(data.id);
      });

      this.referenceCiterne = data.reference;
      this.loadCompartimentsByCiterneReference();
    },
    error: (err) => {
      this.citernes = [];
      this.snackBar.open('Erreur: Impossible de charger la citerne pour ce camion', 'Fermer', { duration: 3000 });
    }
  });

  }

  genererCodeLivraison(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codeLivraison = 'LIV-';
    for (let i = 0; i < 10; i++) {
      codeLivraison += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    this.addLivraisonForm.get('codeLivraison')?.setValue(codeLivraison);
    this.addLivraisonForm.get('codeLivraison')?.markAsTouched();
    console.log("Code généré :", codeLivraison);
  }

  private loadCommandes(): void {
    this.cService.getAllCommandes().subscribe({
      next: (data) => this.commandes = data,
      error: (err) => console.error('Erreur lors du chargement des commandes', err)
    });
  }

  private loadMarquesCamions(): void {
    this.camionService.getCamions().subscribe({
      next: (data: any) => {
        this.camions = data; // Stocker tous les camions
        this.marquesCamion = Array.from(new Set(data.map((camion: any) => camion.marque)));
      },
      error: (err) => console.error('Erreur lors du chargement des camions', err)
    });
  }

  onMarqueSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const marque = target.value;

    this.camionService.getCamionsByMarque(marque).subscribe({
      next: (data: any[]) => {
        this.immatriculations = data.map((camion: any) => camion.immatriculation);
        this.addLivraisonForm.get('immatriculation')?.setValue('');  // Réinitialiser l'immatriculation
      },
      error: (err) => console.error('Erreur lors du chargement des camions pour cette marque', err)
    });
  }

  addLivraison(): void {
    if (this.addLivraisonForm.invalid) {
      return;
    }
    const commandesSelectionnees = this.addLivraisonForm.get('commandeId')?.value;
  console.log('Commandes sélectionnées :', commandesSelectionnees);
    const camionId = this.getCamionIdByImmatriculation(this.addLivraisonForm.get('immatriculation')?.value);
    if (!camionId) {
      this.snackBar.open('Erreur : Camion non trouvé.', 'Fermer', { duration: 3000 });
      return;
    }

    const livraisonData = {
      codeLivraison: this.addLivraisonForm.get('codeLivraison')?.value,
      commandes: [{ id: this.addLivraisonForm.get('commandeId')?.value }],
      dateLivraison: this.addLivraisonForm.get('date')?.value,
      camion: { id: camionId }, // ✅ Correction ici
      statut: this.addLivraisonForm.get('statut')?.value
    };

    console.log('Données envoyées au backend :', livraisonData);

    fetch('http://localhost:8080/api/livraisons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(livraisonData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur dans la réponse du serveur');
        }
        return response.json();
      })
      .then(data => {
        console.log('Livraison ajoutée avec succès', data);
        
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout de la livraison', error);
        this.snackBar.open(`Erreur: ${error.message || 'Une erreur inconnue est survenue.'}`, 'Fermer', { duration: 3000 });
      });
  }

  
}
