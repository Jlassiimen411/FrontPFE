import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
    public _dialogRef: MatDialogRef<AddCommandeComponent>
  ) {}

  ngOnInit(): void {
    this.addCommandeForm = this.fb.group({
      numero: [null, Validators.required],
      produits: this.fb.array([], Validators.required),
      quantite: [null, [Validators.required, Validators.min(1)]],
      dateCommande: [null, Validators.required],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      totalPrice: [{ value: 0, disabled: true }]  // Make totalPrice field read-only
    });
  
    this.loadProduits();
  
    // Automatically calculate the total price when quantity or price changes
    this.addCommandeForm.get('quantite')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  
    this.addCommandeForm.get('price')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }
  
// Vous avez déjà un champ totalPrice dans votre formulaire, assurez-vous qu'il est bien calculé :
calculateTotalPrice() {
  const quantity = this.addCommandeForm.get('quantite')?.value;
  const price = this.addCommandeForm.get('price')?.value;

  if (quantity && price) {
    this.totalPrice = quantity * price;  // Calcul du prix total
    this.addCommandeForm.get('totalPrice')?.setValue(this.totalPrice);  // Mettre à jour le champ totalPrice
  }
}

  
loadProduits() {
  this.pService.getAllProduits().subscribe(
    (res: any[]) => {
      this.produits = res;
      console.log(this.produits);  // Vérifiez ici que chaque produit a bien un prix
      this.populateProduitsCheckbox();
    },
    (error) => console.error('Erreur lors du chargement des produits:', error)
  );
}

  

  populateProduitsCheckbox() {
    const produitsArray = this.addCommandeForm.get('produits') as FormArray;
    produitsArray.clear();
    this.produits.forEach(() => produitsArray.push(this.fb.control(false)));
  }



  addCommande() {
    if (this.addCommandeForm.invalid) {
      this.isFailed = true;
      console.error("Formulaire invalide", this.addCommandeForm.value);
      return;
    }
  
    // Sélectionner les produits avec la quantité correspondante
    const produitsSelectionnes = this.produits
      .filter((_, index) => (this.addCommandeForm.get('produits') as FormArray).at(index).value)
      .map((p, index) => {
        if (!p.nomProduit) {
          console.error("Nom du produit introuvable pour l'ID : " + p.id);
        }
        return {
          id: p.id,
          nomProduit: p.nomProduit,  // Ensure the product name is correctly included
          quantite: this.addCommandeForm.get('quantite')?.value
        };
      });
  
    if (produitsSelectionnes.length === 0) {
      console.error("Aucun produit sélectionné !");
      this.isFailed = true;
      return;
    }
  
    const commandeData = {
      numero: this.addCommandeForm.get('numero')?.value,
      quantite: this.addCommandeForm.get('quantite')?.value,
      dateCommande: this.addCommandeForm.get('dateCommande')?.value,
      price: this.addCommandeForm.get('price')?.value,
      produits: produitsSelectionnes // Ajouter la structure complète des produits et quantités
    };
  
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