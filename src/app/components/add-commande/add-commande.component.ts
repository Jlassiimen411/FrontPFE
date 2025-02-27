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
      date: [null, Validators.required],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]]
    });

    this.loadProduits();
  }

  loadProduits() {
    this.pService.getAllProduits().subscribe(
      (res: any[]) => {
        this.produits = res;
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
      .map((p, index) => ({
        id: p.id,
        quantite: this.addCommandeForm.get('quantite')?.value // Assurez-vous que chaque produit a une quantité associée
      }));
  
    if (produitsSelectionnes.length === 0) {
      console.error("Aucun produit sélectionné !");
      this.isFailed = true;
      return;
    }
  
    const commandeData = {
      numero: this.addCommandeForm.get('numero')?.value,
      quantite: this.addCommandeForm.get('quantite')?.value,
      dateCommande: this.addCommandeForm.get('date')?.value,
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