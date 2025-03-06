import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitService } from 'src/app/services/produit.service';

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {

  produitForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.produitForm = this.fb.group({
      codeProduit: ['', Validators.required],
      nomProduit: ['', Validators.required],
      libelle: [''],
      prix: ['', [Validators.required, Validators.min(0)]],
      date: [''],
      description: ['']
    });
  }

  saveProduit(): void {
    if (this.produitForm.valid) {
      this.loading = true;
      this.produitService.addProduit(this.produitForm.value).subscribe({
        next: () => {
          console.log('Produit ajouté avec succès');
          // Optionnel : rediriger ou afficher une notification de succès
          this.produitForm.reset();  // Réinitialise le formulaire après soumission
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Une erreur est survenue lors de l\'ajout du produit.';
          console.error('Erreur lors de l\'ajout du produit:', err);
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
    }
  }

  cancelAdd(): void {
    this.produitForm.reset();  // Réinitialise le formulaire si l'utilisateur annule
  }
}
