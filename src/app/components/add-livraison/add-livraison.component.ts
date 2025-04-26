import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';

import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, switchMap, map, catchError, of, first } from 'rxjs';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { CiterneService } from 'src/app/services/citerne.service';
interface Commande {
  idCommande: number;
  codeCommande: string;
  typeProduit: string;
  produitNom: string;
  commandeQuantite: number;
  dateCommande: Date;
  prix: number;
}

interface Compartiment {
  reference: string;
  capaciteMax: number;
  statut: string;
  typeProduit: string;

  commandesAffectees?: Commande[];      // ← ajout
  capaciteRestante?: number;            // ← ajout
}

@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  selectedCommande!: Commande;
  referenceCiterne: string = ''; // pour stocker la référence de citerne saisie
  filteredCommandes: Commande[] = [];
  listeCommandes: Commande[] = [];
  addLivraisonForm!: FormGroup;
  marquesCamion: string[] = [];
  immatriculations: string[] = [];
  commandes: any[] = [];
  camions: any[] = [];
  citernes: { id: number, reference: string, capacite: number }[] = [];
  compartiments: Compartiment[] = [];


  compartimentCommandesMap: { [reference: string]: Commande[] } = {};

 /* compartiments: any[] = [];*/
  constructor(
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
    this.chargerCiternes();
    this.loadMarquesCamions();
    this.cService.getAllCommandes().subscribe(data => {
      this.filteredCommandes = data;
      this.listeCommandes = data;
     
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

    },
    error: (err) => {
      this.snackBar.open('Erreur: Impossible de charger la citerne pour ce camion', 'Fermer', { duration: 3000 });
    }
  });

  }





  initialiserCompartimentCommandesMap() {
    this.compartimentCommandesMap = {};
  
    this.compartiments.forEach(compartiment => {
      this.compartimentCommandesMap[compartiment.reference] = this.listeCommandes
        .filter(cmd =>
          cmd.typeProduit === compartiment.typeProduit &&
          cmd.commandeQuantite <= compartiment.capaciteMax
        )
        .sort((a, b) => {
          const dateA = new Date(a.dateCommande).getTime();
          const dateB = new Date(b.dateCommande).getTime();
          return dateA === dateB ? a.commandeQuantite - b.commandeQuantite : dateA - dateB;
        });
    });
  }
  
  selectCommande(compartiment: any, commande: any) {
    if (!compartiment.commandesAffectees) {
      compartiment.commandesAffectees = [];
    }
  
    // Vérifie si la commande est déjà affectée
    const dejaAffectee = compartiment.commandesAffectees.some((c: Commande) => c.idCommande === commande.idCommande)
    ;
    if (!dejaAffectee) {
      compartiment.commandesAffectees.push(commande);
      
      // Optionnel : mise à jour de la capacité restante
      compartiment.capaciteRestante = (compartiment.capaciteRestante || compartiment.capaciteMax) - commande.commandeQuantite;
  
      // Ré-appliquer le filtre
      this.compartimentCommandesMap[compartiment.reference] = this.commandes
        .filter(cmd =>
          cmd.typeProduit === compartiment.typeProduit &&
          cmd.commandeQuantite <= compartiment.capaciteRestante &&
          !compartiment.commandesAffectees.find((c: Commande) => c.idCommande === cmd.idCommande)

        )
        .sort((a, b) => {
          const dateA = new Date(a.dateCommande).getTime();
          const dateB = new Date(b.dateCommande).getTime();
          return dateA === dateB ? a.commandeQuantite - b.commandeQuantite : dateA - dateB;
        });
    }
  }
  
  remplirCompartimentsAuto(): void {
    // On fait une copie des commandes disponibles
    const commandesDispo = [...this.listeCommandes];
  
    this.compartiments.forEach(compartiment => {
      compartiment.commandesAffectees = [];
      let capaciteRestante = compartiment.capaciteMax;
  
      // On filtre les commandes par type produit et quantité <= capacité restante
      const commandesCompatibles = commandesDispo
        .filter(cmd => cmd.typeProduit === compartiment.typeProduit && cmd.commandeQuantite <= capaciteRestante)
        .sort((a, b) => {
          const dateA = new Date(a.dateCommande).getTime();
          const dateB = new Date(b.dateCommande).getTime();
  
          // Priorité à la date, puis à la quantité
          return dateA === dateB ? a.commandeQuantite - b.commandeQuantite : dateA - dateB;
        });
  
      // On ajoute les commandes une à une jusqu’à remplir au mieux le compartiment
      for (const commande of commandesCompatibles) {
        if (commande.commandeQuantite <= capaciteRestante) {
          compartiment.commandesAffectees.push(commande);
          capaciteRestante -= commande.commandeQuantite;
  
          // On retire cette commande de la liste globale pour éviter qu’elle soit réutilisée ailleurs
          const index = commandesDispo.findIndex(c => c.idCommande === commande.idCommande);
          if (index !== -1) commandesDispo.splice(index, 1);
        }
      }
  
      // Mise à jour de la capacité restante dans le compartiment
      compartiment.capaciteRestante = capaciteRestante;
  
      // Mise à jour de la map pour affichage
      this.compartimentCommandesMap[compartiment.reference] = compartiment.commandesAffectees;
    });
  }
  
  filtrerEtTrierCommandes(commandes: Commande[], compartiment: Compartiment): Commande[] {
    // Étape 1: filtrer les commandes qui ont le même type de produit que le compartiment
    let commandesFiltrees = commandes.filter(cmd =>
      cmd.typeProduit === compartiment.typeProduit &&
      cmd.commandeQuantite <= compartiment.capaciteMax
    );
  
    // Étape 2: trier les commandes par date croissante
    commandesFiltrees.sort((a, b) => {
      const dateA = new Date(a.dateCommande).getTime();
      const dateB = new Date(b.dateCommande).getTime();
      return dateA - dateB;
    });
  
    // Étape 3: trier les commandes par capacité restante (ordre croissant de la capacité restante dans le compartiment)
    commandesFiltrees.sort((a, b) => {
      const resteA = compartiment.capaciteMax - a.commandeQuantite;
      const resteB = compartiment.capaciteMax - b.commandeQuantite;
      return resteA - resteB;
    });
  
    return commandesFiltrees;
  }
  
  
  
  onCompartimentSelected(compartiment: Compartiment): void {
    // Filtrer et trier les commandes en fonction du compartiment sélectionné
    this.filteredCommandes = this.filtrerEtTrierCommandes(this.listeCommandes, compartiment);
  
    // Vous pouvez également mettre à jour le formulaire avec le compartiment sélectionné si nécessaire
    console.log("Commandes filtrées et triées par capacité restante :", this.filteredCommandes);
  }
  
  
  onCiterneSelectionChange(event: any): void {
    const citerneId = event.target.value;
    if (citerneId) {
      this.compartimentService.getCompartimentsByCiterneId(citerneId).subscribe({
        next: (data) => {
          this.compartiments = data;
          this.initialiserCompartimentCommandesMap(); // ← ajouter ici
  
          this.compartiments.forEach(compartiment => {
            this.compartimentCommandesMap[compartiment.reference] =
              this.filtrerEtTrierCommandes(this.listeCommandes, compartiment);
          });
        },
        error: (err) => {
          console.error("Erreur lors du chargement des compartiments :", err);
          this.compartiments = [];
          this.remplirCompartimentsAuto();
        }
      });
    } else {
      this.compartiments = [];
      this.compartimentCommandesMap = {};
    }
  }
  
  
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
      commandeId: [null, Validators.required],

      date: ['', Validators.required],
      statut: ['', Validators.required],
      typeProduit: ['', Validators.required],
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
  

  


 

  
}

