import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from 'src/app/services/produit.service';
import { AddProduitComponent } from '../add-produit/add-produit.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-produits-par-type',
  templateUrl: './produits-par-type.component.html',
  styleUrls: ['./produits-par-type.component.css']
})

export class ProduitsParTypeComponent implements OnInit {
  typeId!: number;  // Déclaration de l'ID du type de produit
  typeName: string = '';  // Nom du type de produit
  produits: any[] = [];  // Liste des produits à afficher

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du type de produit depuis l'URL
    this.route.params.subscribe(params => {
      this.typeId = +params['id'];  // Convertir en nombre
      if (this.typeId) {
        this.loadProduits();  // Charger les produits si l'ID est valide
      } else {
        console.error('Invalid typeId:', this.typeId);
      }
    });

    // Récupérer le nom du type de produit depuis les paramètres de la requête
    this.route.queryParams.subscribe(queryParams => {
      this.typeName = queryParams['typeName'] || 'Inconnu';  // Valeur par défaut si non spécifié
    });
  }

  // Charger les produits pour le type sélectionné
  loadProduits(): void {
    this.produitService.getProduitsByType(this.typeId).subscribe({
      next: (data) => {
        this.produits = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
        alert('Une erreur est survenue lors du chargement des produits.');
      }
    });
  }

  // Méthode pour ajouter un produit
  addProduit(): void {
    this.router.navigate(['/addProduit', this.typeId]);  // Rediriger vers la page d'ajout avec l'ID du type
    console.log('Produit ajouté pour le typeId:', this.typeId);
  }

  // Méthode pour éditer un produit
  editProduit(produitId: number): void {
    this.router.navigate(['/editproduit', produitId], {
      queryParams: { typeName: this.typeName },  // Pass the typeName as queryParam if needed
      queryParamsHandling: 'merge'  // This keeps the existing query params
    });
  }
  
  deleteProduit(produitId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduitById(produitId).subscribe(
        () => {
          // Supprimer le produit de la liste localement
          this.produits = this.produits.filter(produit => produit.id !== produitId);
          alert('Produit supprimé avec succès !');
        },
        error => {
          console.error('Erreur lors de la suppression du produit:', error);
          alert('Une erreur est survenue lors de la suppression du produit.');
        }
      );
    }
  }
  

  openDialog(): void {
    const dialogRef = this.dialog.open(AddProduitComponent, {
      data: { typeId: this.typeId }  // Passez `typeId` comme données
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Rafraîchir la liste des produits si nécessaire
        this.loadProduits();
      }
    });
  }
  

}
