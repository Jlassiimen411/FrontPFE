
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommandeService } from 'src/app/services/commande.service';
import { ProduitService } from 'src/app/services/produit.service';
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
  produits: any[] = [];
  totalPrice: number = 0;

  constructor(
    private fb: FormBuilder,
    private cService: CommandeService,
    private pService: ProduitService,
    public _dialogRef: MatDialogRef<AddCommandeComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire avec la date système (readonly)
    this.addCommandeForm = this.fb.group({
      codeCommande: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ], [this.codeCommandeUniqueValidator()]],
      produit: [null, Validators.required],
      quantite: [null, [Validators.required, Validators.min(1)]],
      dateCommande: [{ value: this.getTodayDate(), disabled: true }, Validators.required],
      totalPrice: [0]
    });

    // Charger les produits
    this.loadProduits();

    // Mise à jour automatique du prix total
    this.addCommandeForm.get('produit')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });

    this.addCommandeForm.get('quantite')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }
   codeCommandeUniqueValidator(): AsyncValidatorFn {
      return (control: AbstractControl) => {
        if (!control.value) return of(null);
        return control.valueChanges.pipe(
          debounceTime(400),
          switchMap(code => this.cService.checkCodeCommandeExists(code)),
          map(exists => exists ? { codeProduitExists: true } : null),
          catchError(() => of(null)),
          first()
        );
      };
    }
  
    genererCodeCommande(): void {
      const charset = '0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    
      this.addCommandeForm.get('codeCommande')?.setValue(code);
      this.addCommandeForm.get('codeCommande')?.markAsTouched();
      console.log("Code généré :", code); // ➤ Devrait s'afficher en console
    }
    
    
  // Récupérer la date du jour (format YYYY-MM-DD)
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Calcul automatique du prix total
  calculateTotalPrice() {
    const produitId = this.addCommandeForm.get('produit')?.value;
    const quantite = this.addCommandeForm.get('quantite')?.value;

    if (produitId && quantite) {
      const produit = this.produits.find(p => p.id === Number(produitId));
      if (produit) {
        this.totalPrice = produit.prix * quantite;
        this.addCommandeForm.get('totalPrice')?.setValue(this.totalPrice);
      }
    }
  }

  // Charger les produits
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

  // Soumission du formulaire
  addCommande() {
    if (this.addCommandeForm.invalid) {
      this.isFailed = true;
      console.error('Formulaire invalide:', this.addCommandeForm.value);
      return;
    }

    const selectedProduit = this.produits.find(p => p.id == this.addCommandeForm.get('produit')?.value);
    if (!selectedProduit) {
      console.error('Produit non trouvé !');
      this.isFailed = true;
      return;
    }

    const rawFormData = this.addCommandeForm.getRawValue(); // inclut les champs désactivés

    const commandeData = {
      codeCommande: rawFormData.codeCommande,
      quantite: rawFormData.quantite,
      dateCommande: rawFormData.dateCommande,
      totalPrice: rawFormData.totalPrice,
      produits: [{ id: selectedProduit.id, nomProduit: selectedProduit.nomProduit }]
    };

    console.log('Commande envoyée:', commandeData);

    this.cService.addCommande(commandeData).subscribe(
      (response) => {
        this.isSuccessful = true;
        setTimeout(() => this.isSuccessful = false, 3000);
        this._dialogRef.close(true);

        this.addCommandeForm.get('totalPrice')?.setValue(response.totalPrice);

        console.log('Commande ajoutée avec succès');
      },
      (error) => {
        this.isFailed = true;
        setTimeout(() => this.isFailed = false, 3000);
        console.error('Erreur lors de l\'ajout de la commande:', error);
      }
    );
  }
}
