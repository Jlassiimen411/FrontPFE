import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeService } from 'src/app/services/commande.service';
import { ProduitService } from 'src/app/services/produit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-commande',
  templateUrl: './edit-commande.component.html',
  styleUrls: ['./edit-commande.component.css']
})
export class EditCommandeComponent implements OnInit {
  commandeForm: FormGroup;
  id!: number;
  produits: any[] = [];
  totalPrice: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private produitService: ProduitService
  ) {
    this.commandeForm = this.fb.group({
      codeCommande: [{ value: '', disabled: true }],
      produitId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      dateCommande: ['', Validators.required],
      totalPrice: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.loadProduits();
    this.loadCommande();

    this.commandeForm.get('produitId')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.commandeForm.get('quantite')?.valueChanges.subscribe(() => this.calculateTotalPrice());
  }

  loadCommande(): void {
    this.commandeService.getCommandeById(this.id).subscribe({
      next: (commande) => {
        this.commandeForm.patchValue({
          codeCommande: commande.codeCommande,
          produitId: commande.produits?.[0]?.id || '',
          quantite: commande.quantite,
          dateCommande: commande.dateCommande,
          totalPrice: commande.totalPrice
        });
        this.totalPrice = commande.totalPrice;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Commande introuvable.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (res) => this.produits = res,
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les produits.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  calculateTotalPrice(): void {
    const produitId = this.commandeForm.get('produitId')?.value;
    const quantite = this.commandeForm.get('quantite')?.value;
    const produit = this.produits.find(p => p.id == produitId);

    if (produit && quantite > 0) {
      this.totalPrice = produit.prix * quantite;
      this.commandeForm.get('totalPrice')?.setValue(this.totalPrice);
    }
  }

  editCommande(): void {
    if (this.commandeForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs obligatoires.',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const formValues = this.commandeForm.getRawValue();

    const commandeToUpdate = {
      id: this.id,
      codeCommande: formValues.codeCommande,
      dateCommande: formValues.dateCommande,
      quantite: formValues.quantite,
      totalPrice: this.totalPrice,
      produits: [{ id: formValues.produitId }]
    };

    this.commandeService.updateCommande(commandeToUpdate).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Commande mise à jour avec succès !',
          confirmButtonColor: '#198754'
        }).then(() => this.router.navigate(['/commandes']));
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la mise à jour de la commande.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
