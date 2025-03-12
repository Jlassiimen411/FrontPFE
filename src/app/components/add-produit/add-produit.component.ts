import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProduitService } from 'src/app/services/produit.service';
import { TypeProduitService } from 'src/app/services/type-produit.service'; // Make sure to import the service to fetch types

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {

  produitForm!: FormGroup;
  typesProduit: any[] = [];  // This will hold the list of types
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private dialogRef: MatDialogRef<AddProduitComponent>, // Gérer le popup
    @Inject(MAT_DIALOG_DATA) public data: { typeId: number } // Récupérer l'ID du type
  ) {}
  
  ngOnInit(): void {
    this.produitForm = this.fb.group({
      codeProduit: ['', Validators.required],
      nomProduit: ['', Validators.required],
      libelle: [''],
      prix: ['', [Validators.required, Validators.min(0)]],
      date: [''],
      description: [''],
      typeProduit: { id: this.data.typeId } // Mettre le type par défaut
    });
  }
  
  // Fermer le popup après l'ajout du produit
  saveProduit(): void {
    if (this.produitForm.valid) {
      const produitData = { 
        ...this.produitForm.value, 
        typeProduit: { id: this.produitForm.value.typeProduit.id }
      };
  
      this.produitService.addProduit(produitData).subscribe({
        next: () => {
          console.log('Produit ajouté avec succès');
          this.dialogRef.close(true); // Fermer le popup et rafraîchir la liste
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du produit:', err);
        }
      });
    }
  }
  
  // Annuler et fermer le popup
  cancelAdd(): void {
    this.dialogRef.close(false);
  }

}