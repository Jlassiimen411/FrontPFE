import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommandeService } from 'src/app/services/commande.service';
import { ProduitService } from 'src/app/services/produit.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { debounceTime, switchMap, map, catchError, of, first } from 'rxjs';

@Component({
  selector: 'app-add-commande',
  templateUrl: './add-commande.component.html',
  styleUrls: ['./add-commande.component.css']
})
export class AddCommandeComponent implements OnInit {
  addCommandeForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = ''; 

  produits: any[] = [];
  prixProduitsSelectionnes: { [index: number]: number } = {};
  totalPrice: number = 0;
  typeProduitsAvecProduits: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cService: CommandeService,
    private pService: ProduitService,
    private typeProduitService: TypeProduitService,
    public _dialogRef: MatDialogRef<AddCommandeComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProduits();
  }

  private initForm(): void {
    this.addCommandeForm = this.fb.group({
      codeCommande: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ]],
      quantite: [0, Validators.required],
      price: [0, Validators.required],
      dateCommande: [this.getTodayDate(), Validators.required],
      produits: this.fb.array([]),
      totalPrice: [0]
    });
    
    
    
    
    
  }
  

  loadProduits(): void {
    this.typeProduitService.getAllTypeProduits().subscribe(data => {
      this.typeProduitsAvecProduits = data;
      this.produits = data.flatMap(type => type.produits);
    });
  }

  codeCommandeUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(400),
        switchMap(code => this.cService.checkCodeCommandeExists(code)),
        map(exists => exists ? { codeCommandeExists: true } : null),
        catchError(() => of(null)),
        first()
      );
    };
  }

  get produitsFormArray(): FormArray {
    return this.addCommandeForm.get('produits') as FormArray;
  }
  

  ajouterProduit(produit: any): void {
    const group = this.fb.group({
      produit: [produit.id, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });

    group.get('quantite')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.produitsFormArray.push(group);

    this.calculateTotalPrice();
  }

  retirerProduit(index: number): void {
    this.produitsFormArray.removeAt(index);
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    let total = 0;
    this.prixProduitsSelectionnes = {};
  
    this.produitsFormArray.controls.forEach((group, index) => {
      const produitId = group.get('produit')?.value;
      const quantite = group.get('quantite')?.value;
      const produit = this.produits.find(p => p.id === Number(produitId));
  
      console.log('Produit sélectionné:', produit);
      console.log('Quantité:', quantite);
  
      if (produit && quantite && quantite > 0) {
        const prix = produit.prix;
        const sousTotal = prix * quantite;
        total += sousTotal;
        this.prixProduitsSelectionnes[index] = prix;
      }
    });
  
    this.addCommandeForm.get('totalPrice')?.setValue(total);
    console.log('Total calculé:', total);
  }
  
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  genererCodeCommande(): void {
    const code = 'CMD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    this.addCommandeForm.get('codeCommande')?.setValue(code);
  }

  onProduitToggle(event: any, produit: any): void {
    if (event.target.checked) {
      this.ajouterProduit(produit);
    } else {
      const index = this.produitsFormArray.controls.findIndex(group => group.get('produit')?.value === produit.id);

      if (index > -1) {
        this.retirerProduit(index);
      }
    }
  }

  getNomProduit(produitId: number): string {
    const produit = this.produits.find(p => p.id === produitId);
    return produit ? produit.nomProduit : 'Produit inconnu';
  }

  addCommande(): void {
    if (this.addCommandeForm.invalid) {
      this.errorMessage = "Le formulaire contient des erreurs.";
      return;
    }
  
    this.isLoading = true;
  
    const formValue = this.addCommandeForm.value;
  
    const produitsTransformes = this.produitsFormArray.controls.map(group => {
      return {
        produitId: group.get('produit')?.value,
        quantite: group.get('quantite')?.value
      };
    });
  
    let commandesAjoutees = 0;
    const totalProduits = produitsTransformes.length;
  
    produitsTransformes.forEach((p, index) => {
      const produit = this.produits.find(prod => prod.id === p.produitId);
      if (!produit) return;
  
      const codeUnique = `${formValue.codeCommande}-${index + 1}`;
  
      const commandeIndividuelle = {
        codeCommande: codeUnique,
        quantite: p.quantite,
        dateCommande: formValue.dateCommande,
        price: produit.prix * p.quantite,
        commandeProduits: [
          {
            produit: { id: p.produitId },
            quantite: p.quantite
          }
        ]
      };
  
      this.cService.addCommande(commandeIndividuelle).subscribe({
        next: (response) => {
          commandesAjoutees++;
          if (commandesAjoutees === totalProduits) {
            this.isSuccessful = true;
            this.isFailed = false;
            this.isLoading = false;
            this.addCommandeForm.reset();
            this.produitsFormArray.clear();
            this.totalPrice = 0;
            console.log("Toutes les commandes ont été ajoutées avec succès!");
            this._dialogRef.close('success'); // ou un objet si tu veux plus de détails

          }
        },
        error: (err) => {
          console.error('Erreur pour une commande :', err);
          this.isFailed = true;
          this.isSuccessful = false;
          this.isLoading = false;
          this.errorMessage = err?.error?.message || "Erreur lors de l'ajout de la commande.";
        }
      });
    });
  }
  
  
  
  
}
