import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommandeService } from 'src/app/services/commande.service';
import { AddCommandeComponent } from '../add-commande/add-commande.component';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  allCommandes: any = [];

  constructor(
    private cService: CommandeService,
    private router: Router,
    private dialog: MatDialog // Import MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.cService.getAllCommandes().subscribe({
      next: (data) => {
        console.log(data);  // Log les données pour vérifier leur structure
        this.allCommandes = data;
      },
      error: (err) => {
        console.error('Error loading commandes', err);
      },
    });
  }
  
  

  deleteCommandeById(id: number): void {
    this.cService.deleteCommandeById(id).subscribe({
      next: (data) => {
        console.log('Commande deleted', data);
        this.loadCommandes();
      },
      error: (err) => {
        console.error('Error deleting commande', err);
      }
    });
  }
  

  goToEdit(id: number): void {
    this.router.navigate(['editcommande', id]);
  }

  // Fonction pour afficher le popup Add Food
  openAddCommandeDialog(): void {
    const dialogRef = this.dialog.open(AddCommandeComponent, {
     
      width: '900px', // Vous pouvez ajuster la largeur
      height:'600px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur
    });

    // Action après fermeture du modal
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCommandes(); // Recharger la liste après ajout
      }
    });
  }
}
