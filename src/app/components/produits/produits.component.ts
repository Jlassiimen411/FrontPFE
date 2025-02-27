import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProduitService } from 'src/app/services/produit.service';
import { AddProduitComponent } from '../add-produit/add-produit.component';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent {
 allProduits: any = [];

  constructor(
    private pService: ProduitService,
    private router: Router,
    private dialog: MatDialog // Import MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.pService.getAllProduits().subscribe({
      next: (data) => {
        this.allProduits = data;
      },
      error: (err) => {
        console.error('Error loading s', err);
      },
    });
  }

  deleteProduitById(id: number): void {
    this.pService.deleteProduitById(id).subscribe({
      next: (data) => {
        console.log('Produit deleted', data);
        this.loadProduits();
      },
      error: (err) => {
        console.error('Error deleting produit', err);
      }
    });
  }
  

  goToEdit(id: number): void {
    this.router.navigate(['editproduit', id]);
  }

  // Fonction pour afficher le popup Add Food
  openAddProduitDialog(): void {
    const dialogRef = this.dialog.open(AddProduitComponent, {
     
      width: '900px', // Vous pouvez ajuster la largeur
      height:'500px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur
    });

    // Action après fermeture du modal
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProduits(); // Recharger la liste après ajout
      }
    });
  }
}
