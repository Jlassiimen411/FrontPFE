import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog'; // Pour gérer la fermeture du popup
import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, switchMap, map, catchError, of, first } from 'rxjs';
@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  addLivraisonForm!: FormGroup;
  marquesCamion: string[] = [];
  immatriculations: string[] = [];
  commandes: any[] = [];
  camions: any[] = [];


  constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    private camionService: CamionService,
    public dialogRef: MatDialogRef<AddLivraisonComponent>,  // Pour fermer le popup
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire
    this.addLivraisonForm = this.fb.group({
      codeLivraison: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ], [this.codeLivraisonAsyncValidator()]],
      commandeId: ['', Validators.required],
      date: ['', Validators.required],
      statut: ['', Validators.required],
      marque: ['', Validators.required],
      immatriculation: ['', Validators.required],
    });

    // Chargement des commandes et des marques de camions
    this.loadCommandes();
    this.loadMarquesCamions();
  }
  codeLivraisonAsyncValidator(): AsyncValidatorFn {
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
  
  genererCodeLivraison(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codeLivraison = 'LIV-';
    for (let i = 0; i < 10; i++) {
      codeLivraison += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  
    this.addLivraisonForm.get('codeLivraison')?.setValue(codeLivraison);
    this.addLivraisonForm.get('codeLivraison')?.markAsTouched();
    console.log("Code généré :", codeLivraison); // ➤ Devrait s'afficher en console
  }
  
  // Fonction pour charger les commandes
  loadCommandes(): void {
    this.cService.getAllCommandes().subscribe({
      next: (data) => this.commandes = data,
      error: (err) => console.error('Erreur lors du chargement des commandes', err)
    });
  }
  getCamionIdByImmatriculation(immatriculation: string): number | null {
    const camionTrouve = this.camions.find(c => c.immatriculation === immatriculation);
    return camionTrouve ? camionTrouve.id : null;
  }
  
  // Fonction pour charger les marques de camions
  loadMarquesCamions(): void {
    this.camionService.getCamions().subscribe({
      next: (data: any) => {
        this.camions = data; // Stocker tous les camions
        this.marquesCamion = Array.from(new Set(data.map((camion: any) => camion.marque)));
      },
      error: (err) => console.error('Erreur lors du chargement des camions', err)
    });
  }
  

  // Fonction appelée lorsqu'une marque de camion est sélectionnée
  onMarqueSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const marque = target.value;

    // Charger les immatriculations basées sur la marque sélectionnée
    this.camionService.getCamionsByMarque(marque).subscribe({
      next: (data: any[]) => {
        this.immatriculations = data.map((camion: any) => camion.immatriculation);
        this.addLivraisonForm.get('immatriculation')?.setValue('');  // Réinitialiser l'immatriculation
      },
      error: (err) => console.error('Erreur lors du chargement des camions pour cette marque', err)
    });
  }

  // Fonction pour ajouter une livraison
  addLivraison(): void {
    if (this.addLivraisonForm.invalid) {
      return;
    }
  
    const camionId = this.getCamionIdByImmatriculation(this.addLivraisonForm.get('immatriculation')?.value);
    if (!camionId) {
      this.snackBar.open('Erreur : Camion non trouvé.', 'Fermer', { duration: 3000 });
      return;
    }
  
    const livraisonData = {
      codeLivraison:  this.addLivraisonForm.get('codeLivraison')?.value,
      commandes: [{ id: this.addLivraisonForm.get('commandeId')?.value }],
      dateLivraison: this.addLivraisonForm.get('date')?.value,
      camion: { id: camionId }, // Envoie uniquement l'ID du camion
      statut: this.addLivraisonForm.get('statut')?.value
    };
  
    console.log('Données envoyées au backend :', livraisonData); // Debug
  
    fetch('http://localhost:8080/api/livraisons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
        this.dialogRef.close(true);
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout de la livraison', error);
        this.snackBar.open(`Erreur: ${error.message || 'Une erreur inconnue est survenue.'}`, 'Fermer', { duration: 3000 });
      });
  }
  
        
  
  

  // Fonction pour annuler l'ajout de la livraison
  onCancel(): void {
    this.dialogRef.close();  // Fermer le pop-up sans soumettre
  }
}
