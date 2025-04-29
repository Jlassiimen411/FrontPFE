import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, map, catchError, of, first, Observable } from 'rxjs';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { CiterneService } from 'src/app/services/citerne.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { Router } from '@angular/router';

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
  commandesAffectees?: Commande[];
  capaciteRestante?: number;
}

@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  selectedCommande!: Commande;
  referenceCiterne: string = '';
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
  isSubmitting: boolean = false;
  constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    private compartimentService: CompartimentService,
    private citerneService: CiterneService,
    private camionService: CamionService,
    private router: Router,
    private typeProduitService: TypeProduitService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.chargerCiternes();
    this.loadMarquesCamions();

      this.typeProduitService.getAllTypeProduits().pipe(
      first(),
      catchError((err) => {
        console.error('Erreur lors du chargement des typeproduits:', err);
        this.snackBar.open('Erreur lors du chargement des types de produits', 'Fermer', { duration: 3000 });
        return of([]);
      })
    ).subscribe((typeProduitsData: any[]) => {
      this.typeproduits = typeProduitsData;
      console.log('TypeProduits chargés:', this.typeproduits);

      this.cService.getAllCommandes().pipe(
        catchError((err) => {
          console.error('Erreur lors du chargement des commandes:', err);
          this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', { duration: 3000 });
          return of([]);
        })
      ).subscribe((data: any[]) => {
        console.log('Commandes reçues:', data);

        data.forEach(commande => {
          commande.commandeProduits.forEach((cp: any) => {
            const produit = cp.produit;
            const typeProduit = this.typeproduits.find(tp =>
              tp.produits.some((p: any) => p.id === produit.id)
            );
            if (typeProduit) {
              produit.typeProduit = typeProduit;
            }
          });
        });
     
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
        console.log('ListeCommandes après transformation:', this.listeCommandes);
      });
    });
  }

  private initForm(): void {
    this.addLivraisonForm = this.fb.group({
      codeLivraison: ['', [Validators.required, /* éventuellement un validateur pour vérifier l'unicité */]],
      date: ['', Validators.required],
      
      camionId: ['', Validators.required],
      citerneId: ['', Validators.required],
      statut: ['', Validators.required]
    });
    
  }

  private codeLivraisonAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }
      return this.lService.checkCodeLivraisonExists(control.value).pipe(
        debounceTime(300),
        map(response => (response.exists ? { codeLivraisonExists: true } : null)),
        catchError(() => of(null)),
        first()
      );
    };
  }

  private loadMarquesCamions(): void {
    this.camionService.getCamions().pipe(
      catchError((err) => {
        console.error('Erreur lors du chargement des camions:', err);
        this.snackBar.open('Erreur lors du chargement des camions', 'Fermer', { duration: 3000 });
        return of([]);
      })
    ).subscribe((data: any) => {
      this.camions = data;
      this.marquesCamion = Array.from(new Set(data.map((camion: any) => camion.marque)));
      console.log('MarquesCamion chargées:', this.marquesCamion);
    });
  }

  onMarqueSelectionChange(event: Event): void { 
    const target = event.target as HTMLSelectElement;
    const marque = target.value;
  
    this.camionService.getCamionsByMarque(marque).pipe(
      catchError((err) => {
        console.error('Erreur lors du chargement des camions pour cette marque:', err);
        this.snackBar.open('Erreur lors du chargement des immatriculations', 'Fermer', { duration: 3000 });
        this.immatriculations = [];  // Assure que la liste est vide en cas d'erreur
        return of([]);
      })
    ).subscribe((data: any[]) => {
      if (data.length > 0) {
        this.immatriculations = data.map((camion: any) => camion.immatriculation);
        this.addLivraisonForm.get('camionImmatriculation')?.setValue('');
      } else {
        this.immatriculations = [];
        this.snackBar.open('Aucune immatriculation disponible pour cette marque', 'Fermer', { duration: 3000 });
      }
      console.log('Immatriculations chargées:', this.immatriculations);
    });
  }
  

  onImmatriculationSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const immatriculation = target.value;
    console.log('Immatriculation sélectionnée:', immatriculation);

    this.camionService.getCiterneByImmatriculation(immatriculation).pipe(
      catchError((err) => {
        console.error('Erreur lors du chargement des citernes pour cette immatriculation:', err);
      
        return of(null);
      })
    ).subscribe((data) => {
      console.log('Citernes pour immatriculation:', data);
      if (data) {
        this.citernes = data;
      }
    });
  }

  private chargerCiternes(): void {
    this.citerneService.getCiternes().pipe(
      catchError((err) => {
        console.error('Erreur lors du chargement des citernes:', err);
        this.snackBar.open('Erreur lors du chargement des citernes', 'Fermer', { duration: 3000 });
        return of([]);
      })
    ).subscribe((data) => {
      this.citernes = data;
      console.log('Citernes chargées:', this.citernes);
    });
  }

  onCiterneSelectionChange(event: any): void {
    const citerneId = event.target.value;
    if (citerneId) {
      this.compartimentService.getCompartimentsByCiterneId(citerneId).pipe(
        catchError((err) => {
          console.error('Erreur lors du chargement des compartiments:', err);
          this.snackBar.open('Erreur lors du chargement des compartiments', 'Fermer', { duration: 3000 });
          return of([]);
        })
      ).subscribe((data) => {
        this.compartiments = data;
        this.initialiserCompartimentCommandesMap();
  
        if (this.compartiments.length === 0) {
          this.snackBar.open('Aucun compartiment disponible pour cette citerne', 'Fermer', { duration: 3000 });
        }
  
        this.compartiments.forEach(compartiment => {
          const commandesCompatibles = this.filtrerEtTrierCommandes(this.listeCommandes, compartiment);
          this.compartimentCommandesMap[compartiment.reference] = commandesCompatibles;
          console.log(`Commandes compatibles pour ${compartiment.reference}:`, commandesCompatibles);
        });
      });
    } else {
      this.compartiments = [];
      this.compartimentCommandesMap = {};
    }
  }
  onDateChangeciterne(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;

    if (selectedDate) {
      // Récupérer les citernes disponibles pour la date
      this.lService.getCiterneDisponiblesPourDate(selectedDate)
        .subscribe((data) => {
          this.citernes = data;
        });
    }
  }


  initialiserCompartimentCommandesMap(): void {
    console.log('Initialisation des compartiments et des commandes...');
    this.compartimentCommandesMap = {};

    this.compartiments.forEach(compartiment => {
      console.log('Traitement du compartiment:', compartiment.reference);
      this.compartimentCommandesMap[compartiment.reference] = this.filtrerEtTrierCommandes(this.listeCommandes, compartiment);
      console.log('Commandes affectées au compartiment:', this.compartimentCommandesMap[compartiment.reference]);
    });
  }

  filtrerEtTrierCommandes(commandes: Commande[], compartiment: Compartiment): Commande[] {
    console.log('⚡ Comparaison pour compartiment:', compartiment.reference);
    console.log('TypeProduit Compartiment:', compartiment.typeProduit, '| Capacité max:', compartiment.capaciteMax);

    const commandesFiltrees = commandes.filter(cmd =>
      cmd.typeProduit?.toLowerCase() === compartiment.typeProduit?.toLowerCase() &&
      cmd.commandeQuantite <= compartiment.capaciteMax
    ).sort((a, b) => {
      const dateA = new Date(a.dateCommande).getTime();
      const dateB = new Date(b.dateCommande).getTime();
      return dateA === dateB ? a.commandeQuantite - b.commandeQuantite : dateA - dateB;
    });

    console.log('✅ Commandes filtrées pour', compartiment.reference, ':', commandesFiltrees);
    return commandesFiltrees;
  }

  onCompartimentSelected(compartiment: Compartiment): void {
    const commandesFiltrees = this.filtrerEtTrierCommandes(this.listeCommandes, compartiment);
    this.filteredCommandes = commandesFiltrees;
    console.log('Commandes filtrées et triées par capacité restante:', this.filteredCommandes);
  }


  selectCommande(compartiment: Compartiment, commande: Commande): void {
    if (!compartiment.commandesAffectees) {
      compartiment.commandesAffectees = [];
    }
  
    const capaciteRestante = compartiment.capaciteRestante ?? compartiment.capaciteMax;
  
    if (commande.commandeQuantite <= capaciteRestante) {
      compartiment.commandesAffectees.push(commande);
  
      // Mise à jour de la capacité restante
      compartiment.capaciteRestante = capaciteRestante - commande.commandeQuantite;
  
      // Retirer la commande de la liste globale pour éviter une réutilisation ailleurs si nécessaire
      this.listeCommandes = this.listeCommandes.filter(c => c.idCommande !== commande.idCommande);
  
      console.log(`✅ Commande ${commande.codeCommande} affectée au compartiment ${compartiment.reference}`);
      console.log('Nouvelle capacité restante:', compartiment.capaciteRestante);
    } else {
      this.snackBar.open('La commande dépasse la capacité disponible du compartiment.', 'Fermer', { duration: 3000 });
    }
  }
  
  


  onSubmit(): void {
    if (this.addLivraisonForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
      return;
    }
  
    // Récupérer la date depuis le formulaire avant de soumettre
    const dateLivraison = this.addLivraisonForm.value.date;
  
    // Charger les camions disponibles à la date choisie
    this.lService.getCamionsDisponibles(dateLivraison).subscribe(
      (data) => {
        this.camions = data; // Mettre à jour la liste des camions avec les résultats
        console.log('Camions disponibles:', data);
  
        // Vérifier que l'utilisateur a sélectionné un camion
        const formValue = this.addLivraisonForm.value;
        if (!formValue.camionId || !formValue.citerneId) {
          this.snackBar.open('Veuillez sélectionner un camion et une citerne.', 'Fermer', { duration: 3000 });
          return;
        }
  
        // Si tout est valide, procéder à l'ajout de la livraison
        if (this.isSubmitting) return;
  
        this.isSubmitting = true;
        this.addLivraisonForm.disable();
  
        const livraisonPayload = {
          codeLivraison: formValue.codeLivraison,
          camion: { id: Number(formValue.camionId) },
          citerne: { id: Number(formValue.citerneId) },
          commandes: formValue.commandes?.map((cmd: number) => ({ id: cmd })) || [],
          dateLivraison: formValue.date,
          statut: formValue.statut
        };
  
        this.lService.addLivraison(livraisonPayload).subscribe({
          next: (response) => {
            console.log('Livraison ajoutée avec succès:', response);
            this.snackBar.open('Livraison ajoutée avec succès.', 'Fermer', { duration: 3000 });
            this.addLivraisonForm.reset();
            this.isSubmitting = false;
            this.addLivraisonForm.enable();
            this.router.navigate(['/livraisons']); // Redirection ici
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout de la livraison:', error);
            this.snackBar.open('Erreur lors de l\'ajout de la livraison.', 'Fermer', { duration: 3000 });
            this.isSubmitting = false;
            this.addLivraisonForm.enable();
          }
        });
      },
      (error) => {
        console.error('Erreur lors de la récupération des camions disponibles:', error);
        this.snackBar.open('Erreur lors du chargement des camions disponibles', 'Fermer', { duration: 3000 });
      }
    );
  }
  
  

  debugForm(): void {
    console.log('Formulaire valide:', this.addLivraisonForm.valid);
    console.log('Valeurs du formulaire:', this.addLivraisonForm.value);
    console.log('Erreurs du formulaire:', this.addLivraisonForm.errors);
    Object.keys(this.addLivraisonForm.controls).forEach(key => {
      const control = this.addLivraisonForm.get(key);
      console.log(`Champ ${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched,
      });
      
    });
  }
  

onDateChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const selectedDate = input.value;

  if (selectedDate) {
    this.lService.getCamionsDisponibles(selectedDate)
      .subscribe((data) => {
        this.camions = data;
      });
  }
}


  genererCodeLivraison(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codeLivraison = 'LIV-';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      codeLivraison += charset[randomIndex];
    }
    this.addLivraisonForm.get('codeLivraison')?.setValue(codeLivraison);
    console.log('Code livraison généré:', codeLivraison);
  }
  
  

}