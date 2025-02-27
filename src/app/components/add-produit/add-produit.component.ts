import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProduitService } from 'src/app/services/produit.service';

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {

  addProduitForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;
  

  constructor(
    private fb: FormBuilder,
    private pService: ProduitService,
    public _dialogRef: MatDialogRef<AddProduitComponent>
  ) {}

  ngOnInit(): void {
    this.addProduitForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      date: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
    });
  }

  addProduit() {
    if (this.addProduitForm.invalid) {
      console.log('Formulaire invalide:', this.addProduitForm.value);
      this.isFailed = true;
      return;
    }

    // Création d'un objet pour envoyer les données
    const productData = {
      name: this.addProduitForm.get('name')?.value,
      description: this.addProduitForm.get('description')?.value,
      price: this.addProduitForm.get('price')?.value,
      date: this.addProduitForm.get('date')?.value,
    };

    // ✅ Affichage des données envoyées
    console.log('Données envoyées:', productData);

    // Envoi de la requête au backend
    this.pService.addProduit(productData).subscribe({
      next: (res) => {
        this.isSuccessful = true;
        this.isFailed = false;
        console.log('Produit ajouté avec succès:', res);
        setTimeout(() => this._dialogRef.close(true), 1000);
      },
      error: (error) => {
        this.isFailed = true;
        console.error('Erreur lors de l\'ajout du produit:', error);
      }
    });
  }
}
