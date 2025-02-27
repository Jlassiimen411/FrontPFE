import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommandeService } from 'src/app/services/commande.service';
import { LivraisonService } from 'src/app/services/livraison.service';

@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  addLivraisonForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;
  selectedFile: File | null = null;
  allLivraisons: any[] = [];  // Declare the property to hold all livraisons
  calendarEvents: any[] = []; 
  commandes: any[] = [];  // Declare the property for calendar events

  constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    public _dialogRef: MatDialogRef<AddLivraisonComponent> // Keep as public for dialog interaction
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire réactif
    this.addLivraisonForm = this.fb.group({
      livraisonId: ['', Validators.required],
      commandeId: ['', Validators.required],
      date: ['', Validators.required],
      dateCommande: ['', Validators.required],
      statut: ['', Validators.required]
    });
    this.loadCommandes();
  }

  // Gestion du changement de fichier
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.addLivraisonForm.patchValue({ file: this.selectedFile });
    }
  }

  // Ajout d'une Livraison
  addLivraison() {
    if (this.addLivraisonForm.invalid) {
      this.isFailed = true;
      return;
    }
  
    const statut = this.addLivraisonForm.get('statut')?.value;
  
    // Mapping des valeurs avant l'envoi
    const statutMapped = statut === 'en-attente' ? 'EN_ATTENTE' : statut === 'livre' ? 'LIVRE' : 'ANNULE';
  
    const dateCommande = this.addLivraisonForm.get('dateCommande')?.value;
    const dateLivraison = this.addLivraisonForm.get('date')?.value;
  
    // Si ce sont des chaînes, on les envoie directement, sinon on les convertit en format string
    const livraisonData = {
      commandeId: this.addLivraisonForm.get('commandeId')?.value,
      dateCommande: (dateCommande instanceof Date ? dateCommande.toISOString().split('T')[0] : dateCommande),
      dateLivraison: (dateLivraison instanceof Date ? dateLivraison.toISOString().split('T')[0] : dateLivraison),
      statut: statutMapped
    };
  
    this.lService.addLivraison(livraisonData).subscribe(
      (res) => {
        this.isSuccessful = true;
        this._dialogRef.close(true);
        console.log('Livraison ajoutée avec succès', res);
        this.loadLivraisons();
      },
      (error) => {
        this.isFailed = true;
        console.error('Erreur lors de l\'ajout de la livraison:', error);
      }
    );
  }
  
  
  
  loadLivraisons(): void {
    this.lService.getAllLivraisons().subscribe({
        next: (data) => {
            this.allLivraisons = data;
            // Mettre à jour les événements du calendrier avec les nouvelles livraisons
            this.calendarEvents = data.map((livraison: any) => {
                return {
                    title: "Livraison ${livraison.commandeId}",
                    start: livraison.dateLivraison, // Assurez-vous que cette date est au bon format
                    description: livraison.statut
                };
            });
        },
        error: (err) => {
            console.error('Error loading livraisons', err);
        }
    });
  }

  loadCommandes(): void {
    this.cService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data;  // Récupérer toutes les commandes et les assigner à commandes
      },
      error: (err) => {
        console.error('Error loading commandes', err);
      }
    });
  }

}