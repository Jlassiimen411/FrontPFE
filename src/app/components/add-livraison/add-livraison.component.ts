import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';

import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, switchMap, map, catchError, of, first } from 'rxjs';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { CiterneService } from 'src/app/services/citerne.service';

@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  ngOnInit(): void {}/*
  referenceCiterne: string = ''; // pour stocker la référence de citerne saisie
  
  addLivraisonForm!: FormGroup;
  marquesCamion: string[] = [];
  immatriculations: string[] = [];
  commandes: any[] = [];
  camions: any[] = [];
  citernes: { id: number, reference: string, capacite: number }[] = [];
  compartiments: { reference: string, capaciteMax: number, statut: string }[] = [];
 /* compartiments: any[] = [];*/
 /* constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    private compartimentService: CompartimentService,
    private citerneService: CiterneService,
    private camionService: CamionService,
   
    private snackBar: MatSnackBar
  ) {}

 
  ngOnInit(): void {
    this.initForm();
    this.chargerCiternes(); // ← ajoute cette ligne
  }
  onCiterneSelectionChange(event: any): void {
    const citerneId = event.target.value;
    if (citerneId) {
      this.compartimentService.getCompartimentsByCiterneId(citerneId).subscribe({
        next: (data) => this.compartiments = data,
        error: (err) => {
          console.error("Erreur lors du chargement des compartiments :", err);
          this.compartiments = [];
        }
      });
    } else {
      this.compartiments = [];
    }}
  private chargerCiternes(): void {
    this.citerneService.getCiternes().subscribe({
      next: (data) => {
        this.citernes = data;
        console.log('Citernes chargées :', this.citernes);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des citernes :', err);
        this.snackBar.open("Erreur de chargement des citernes", "Fermer", {
          duration: 3000
        });
      }
    });
  }
  
  private initForm(): void {
    this.addLivraisonForm = this.fb.group({
      codeLivraison: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ], [this.codeLivraisonAsyncValidator()]],
      commandeId: [[], Validators.required],
      date: ['', Validators.required],
      statut: ['', Validators.required],
      camionMarque: ['', Validators.required],
      camionImmatriculation: ['', Validators.required],
      citerneId: ['', Validators.required], // 👈 AJOUT ICI
      // Ajoute ici les autres champs si besoin
    });
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
  

  
  */

 

  
}
