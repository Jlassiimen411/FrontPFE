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
   id!: number;
 
   constructor(
     private activatedRoute: ActivatedRoute,
     private pService: ProduitService,
     private router: Router
   ) {}
 
   ngOnInit(): void {
     this.id = this.activatedRoute.snapshot.params['id'];
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
     this.pService.updateProduit(this.produit).subscribe(
       (res) => {
         console.log('Produit mis à jour avec succès:', res);
         this.router.navigate(['/produits']); // Redirection après mise à jour
       },
       (error) => {
         console.error('Erreur lors de la mise à jour du produit', error);
       }
     );
   }
 }
 