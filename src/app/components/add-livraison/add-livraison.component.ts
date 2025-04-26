import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';

import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, switchMap, map, catchError,forkJoin, of, first,Observable } from 'rxjs';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { CiterneService } from 'src/app/services/citerne.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
interface Commande {
  idCommande: number;
  codeCommande: string;
  typeProduit: string;
  produitNom: string;
  commandeQuantite: number;
  dateCommande: Date;
  prix: number;
  typeProduitApi?: string;  
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
  typeproduits: any[] = [];


  compartimentCommandesMap: { [reference: string]: Commande[] } = {};

 /* compartiments: any[] = [];*/
  constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    private compartimentService: CompartimentService,
    private citerneService: CiterneService,
    private camionService: CamionService,
    private typeProduitService:TypeProduitService,
   
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.chargerCiternes();
    this.loadMarquesCamions();
  
    // 1. Charger d'abord les typeproduits
    this.typeProduitService.getAllTypeProduits().pipe(
      first()
    ).subscribe((typeProduitsData: any[]) => {
      this.typeproduits = typeProduitsData; // Stocke les types de produits
  
      // 2. Puis charger les commandes
      this.cService.getAllCommandes().subscribe(data => {
        console.log('Commandes reçues :', data);
  
        // Ajouter ici ton code de mapping
        data.forEach(commande => {
          commande.commandeProduits.forEach((cp: any) => {
            const produit = cp.produit;
            const typeProduit = this.typeproduits.find(tp =>
              tp.produits.some((p: any) => p.id === produit.id)
            );
            if (typeProduit) {
              produit.typeProduit = typeProduit; // On injecte le typeProduit
            }
          });
        });
  
        // Ensuite transformer tes commandes comme tu le fais déjà
        this.listeCommandes = data.map(cmd => {
          const produit = cmd.commandeProduits[0]?.produit;
          return {
            idCommande: cmd.id,
            codeCommande: cmd.codeCommande,
            produitNom: produit ? produit.nomProduit : 'Nom inconnu',
            typeProduit: produit ? (produit.typeProduit?.name || produit.typeProduit || 'Type inconnu') : 'Type inconnu',
            commandeQuantite: cmd.quantite,
            dateCommande: new Date(cmd.dateCommande),
            prix: cmd.price
          };
        });
      });
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
  

  }

  initialiserCompartimentCommandesMap() {
    console.log('Initialisation des compartiments et des commandes...');
    this.compartimentCommandesMap = {};
  
    this.compartiments.forEach(compartiment => {
      console.log('Traitement du compartiment:', compartiment.reference);
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
  
      console.log('Commandes affectées au compartiment:', this.compartimentCommandesMap[compartiment.reference]);
    });
  }
  selectCommande(compartiment: any, commande: any) {
    if (!compartiment.commandesAffectees) {
      compartiment.commandesAffectees = [];
    }
  
    const dejaAffectee = compartiment.commandesAffectees.some((c: Commande) => c.idCommande === commande.idCommande);
  
    if (!dejaAffectee) {
      compartiment.commandesAffectees.push(commande);
      compartiment.capaciteRestante -= commande.commandeQuantite;
  
      console.log('Commandes affectées après sélection:', compartiment.commandesAffectees); // Ajout du log pour vérifier
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
          if (!compartiment.commandesAffectees) {
            compartiment.commandesAffectees = [];
          }
          compartiment.commandesAffectees.push(commande);
          capaciteRestante -= commande.commandeQuantite;
  
          // Retirer la commande des commandes disponibles
          const index = commandesDispo.findIndex(cmd => cmd.idCommande === commande.idCommande);
          if (index !== -1) {
            commandesDispo.splice(index, 1);
          }
        }
      }
      compartiment.capaciteRestante = capaciteRestante;
    });
  }
  filtrerEtTrierCommandes(commandes: Commande[], compartiment: Compartiment): Observable<Commande[]> {
    console.log("⚡ Comparaison pour compartiment:", compartiment.reference);
    console.log("TypeProduit Compartiment:", compartiment.typeProduit, "| Capacité max:", compartiment.capaciteMax);
  
    // Créer un tableau de Promesses pour récupérer les types de produits pour chaque commande
    const promesses = commandes.map(cmd => 
      this.cService.getTypeProduitsParCommande(cmd.idCommande).pipe(
        map((typeProduits: any[]) => {
          // Ajouter le type produit récupéré à la commande
          cmd.typeProduitApi = typeProduits[0]?.typeProduit;  // Je suppose que tu veux juste le premier type produit
          return cmd;
        })
      )
    );
  
    // Attendre que toutes les promesses soient résolues
    return forkJoin(promesses).pipe(
      map(() => {
        // Filtrer les commandes en fonction du type de produit et de la quantité
        let commandesFiltrees = commandes.filter(cmd =>
          cmd.typeProduitApi?.toLowerCase() === compartiment.typeProduit?.toLowerCase() &&
          cmd.commandeQuantite <= compartiment.capaciteMax
        );
  
        console.log("✅ Commandes filtrées pour", compartiment.reference, ":", commandesFiltrees);
        return commandesFiltrees;
      })
    );
  }
  
  
  onCompartimentSelected(compartiment: Compartiment): void {
    // Filtrer et trier les commandes en fonction du compartiment sélectionné
    this.filtrerEtTrierCommandes(this.listeCommandes, compartiment).subscribe((commandesFiltrees) => {
      this.filteredCommandes = commandesFiltrees;
    });
    
  
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
    
          // Pour chaque compartiment, charger les commandes compatibles avec l'API
          this.compartiments.forEach(compartiment => {
            this.filtrerEtTrierCommandes(this.listeCommandes, compartiment).subscribe(commandesCompatibles => {
              console.log(`Commandes compatibles pour ${compartiment.reference}:`, commandesCompatibles);
              // Maintenant on assigne le tableau de commandes compatibles dans compartimentCommandesMap
              this.compartimentCommandesMap[compartiment.reference] = commandesCompatibles;
            });
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

