import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProduitService } from 'src/app/services/produit.service';

@Component({
  selector: 'app-edit-produit',
  templateUrl: './edit-produit.component.html',
  styleUrls: ['./edit-produit.component.css']
})
export class EditProduitComponent {
  produit: any = {};
  types: any[] = [];
   id!: number;
   typeId!: number; 
 
   constructor(
     private activatedRoute: ActivatedRoute,
     private pService: ProduitService,
     private router: Router
   ) {}
 
   ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    if (!this.id) {
      console.error('L\'ID du produit est manquant.');
      return;
    }
    this.pService.getProduitById(this.id).subscribe(
      (res) => {
        console.log('Produit récupéré :', res);
        this.produit = res;
      },
      (err) => {
        console.error('Erreur lors de la récupération du produit', err);
      }
    );
  }
  
 
  editProduit() {

  
    if (!this.produit.id) {
      alert('L\'ID du produit est manquant.');
      return;
    }
  
    console.log(this.produit); // Vérifiez que le typeProduit est bien présent ici
  
    this.pService.updateProduit(this.produit).subscribe(
      (res) => {
        console.log('Produit mis à jour avec succès:', res);
        this.router.navigate(['/type_produit']);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du produit', error);
      }
    );
  }
  
}  