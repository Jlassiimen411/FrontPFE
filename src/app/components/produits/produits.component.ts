import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProduitService } from 'src/app/services/produit.service';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent implements OnInit {
  produits: any[] = [];
  typeName: string = '';

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const typeId = params['typeId'];
      this.typeName = params['typeName'];
  
      if (typeId) {
        this.loadProduitsByType(typeId);
      } else {
        console.error('TypeId is undefined!');
      }
    });
  }
  

  loadProduitsByType(typeId: number): void {
    this.produitService.getProduitsByType(typeId).subscribe({
      next: (data) => {
        this.produits = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
      }
    });
  }
}
