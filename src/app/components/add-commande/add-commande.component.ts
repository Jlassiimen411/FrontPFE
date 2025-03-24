import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommandeService } from 'src/app/services/commande.service';
import { ProduitService } from 'src/app/services/produit.service';

@Component({
  selector: 'app-add-commande',
  templateUrl: './add-commande.component.html',
  styleUrls: ['./add-commande.component.css']
})
export class AddCommandeComponent implements OnInit {
  addCommandeForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;
  produits: any[] = [];
  totalPrice: number = 0;

  constructor(
    private fb: FormBuilder,
    private cService: CommandeService,
    private pService: ProduitService,
    public _dialogRef: MatDialogRef<AddCommandeComponent>,
    private cdr: ChangeDetectorRef // Pour détecter les changements dans le DOM
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire
    this.addCommandeForm = this.fb.group({
      numero: [null, Validators.required],
      produit: [null, Validators.required],  
      quantite: [null, [Validators.required, Validators.min(1)]],
      dateCommande: [null, Validators.required],
      totalPrice: [{ value: 0, disabled: true }]  // Champ calculé, désactivé
    });

    // Charger les produits
    this.loadProduits();

    // Mettre à jour automatiquement le prix total lors de la sélection du produit ou de la quantité
    this.addCommandeForm.get('produit')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });

    this.addCommandeForm.get('quantite')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  // Calcul du prix total basé sur le produit sélectionné et la quantité
  calculateTotalPrice() {
    const produitId = this.addCommandeForm.get('produit')?.value;
    const quantite = this.addCommandeForm.get('quantite')?.value;

    if (produitId && quantite) {
      const produit = this.produits.find(p => p.id === Number(produitId));  // Conversion à Number pour éviter problème de type

      if (produit) {
        // Calcul du prix total
        this.totalPrice = produit.prix * quantite;

        // Mise à jour du champ totalPrice dans le formulaire
        this.addCommandeForm.get('totalPrice')?.setValue(this.totalPrice);

        // Forcer la détection des changements
        this.cdr.detectChanges();
      } else {
        console.error('Produit non trouvé!');
        this.addCommandeForm.get('totalPrice')?.setValue(0); // Remise à zéro en cas d'erreur
      }
    } else {
      this.addCommandeForm.get('totalPrice')?.setValue(0); // Remise à zéro en cas de quantité manquante
    }
  }

  // Chargement des produits depuis le service ProduitService
  loadProduits() {
    this.pService.getAllProduits().subscribe(
      (res: any[]) => {
        this.produits = res;
      },
      (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.isFailed = true;
      }
    );
  }

  // Ajout d'une commande
  addCommande() {
    if (this.addCommandeForm.invalid) {
      this.isFailed = true;
      console.error('Formulaire invalide:', this.addCommandeForm.value);
      return;
    }
  
    // Récupérer le produit sélectionné
    const selectedProduit = this.produits.find(p => p.id == this.addCommandeForm.get('produit')?.value);
  
    if (!selectedProduit) {
      console.error('Produit non trouvé !');
      this.isFailed = true;
      return;
    }
  
    // Données de la commande à ajouter, avec totalPrice au lieu de price
    const commandeData = {
      numero: this.addCommandeForm.get('numero')?.value,
      quantite: this.addCommandeForm.get('quantite')?.value,
      dateCommande: this.addCommandeForm.get('dateCommande')?.value,
      totalPrice: this.addCommandeForm.get('totalPrice')?.value,  // Utilisation du champ totalPrice calculé
      produits: [{ id: selectedProduit.id, nomProduit: selectedProduit.nomProduit }]
    };
  
    // Appeler le service CommandeService pour ajouter la commande
    this.cService.addCommande(commandeData).subscribe(
      () => {
        this.isSuccessful = true;
        this._dialogRef.close(true);
        console.log('Commande ajoutée avec succès');
      },
      (error) => {
        this.isFailed = true;
        console.error('Erreur lors de l\'ajout de la commande:', error);
      }
    );
  }
  
}
