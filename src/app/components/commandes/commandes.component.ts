
import { Component, OnInit } from '@angular/core';
import { CommandeService } from 'src/app/services/commande.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCommandeComponent } from '../add-commande/add-commande.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  allCommandes: any[] = []; // Stocke toutes les commandes
  produits: any[] = []; // Stocke tous les produits extraits des commandes
  typeProduits: any[] = [];
  commandes: any[] = [];
  constructor(
    private cService: CommandeService,
    private typeProduitService: TypeProduitService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTypeProduitsEtCommandes();
   
  }
  loadTypeProduitsEtCommandes(): void {
    this.typeProduitService.getAllTypeProduits().subscribe({
      next: (types) => {
        this.typeProduits = types;
        this.loadCommandes(); // Charger les commandes après avoir chargé les types
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types de produits', err);
      }
    });
  }
  

  
  loadCommandes(): void {
    this.cService.getAllCommandes().subscribe(
      (data) => {
        this.commandes = data;
        console.log('Commandes reçues : ', this.commandes);
        this.allCommandes = data;         // Ajoute cette ligne pour que extractProduits() fonctionne
        this.extractProduits();           // 🔥 C’est ça qui manquait
      },
      (error) => {
        console.error('Erreur lors de la récupération des commandes', error);
      }
    );
  }
  



  extractProduits(): void {
    this.produits = []; // Réinitialiser les produits
    this.allCommandes.forEach((commande: any) => {
      if (Array.isArray(commande.commandeProduits)) {
        commande.commandeProduits.forEach((cp: any) => {
          const produit = cp.produit;
          const typeTrouve = this.typeProduits.find(type =>
            type.produits.some((p: any) => p.id === produit.id)

          );
          
          // Chercher si le produit existe déjà dans la liste
          const produitExist = this.produits.find(p => p.idCommande === commande.id && p.produitNom === produit.nomProduit);
          
          if (produitExist) {
            // Mettre à jour la quantité du produit existant
            produitExist.quantite = cp.quantite || 'Non définie';
          } else {
            // Ajouter un nouveau produit si ce n'est pas encore dans la liste
            this.produits.push({
              idCommande: commande.id,
              codeCommande: commande.codeCommande,
              produitNom: produit.nomProduit || 'Nom introuvable',
              commandeQuantite: commande.quantite || 'Non définie',
              dateCommande: commande.dateCommande,
              prix: commande.price || 0,
              typeProduit: typeTrouve?.name || 'Type inconnu'
            });
          }
        });
      }
    });
  }

  
  
  

  deleteCommandeById(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
      text: `ID de la commande : ${id}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cService.deleteCommandeById(id).subscribe({
          next: (data) => {
            console.log('Commande supprimée', data);
            Swal.fire({
              title: 'Supprimée !',
              text: 'La commande a été supprimée avec succès.',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadCommandes(); // Recharger les commandes après suppression
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de la commande', err);
            Swal.fire({
              title: 'Erreur !',
              text: `Erreur lors de la suppression de la commande. Détails: ${err?.message || 'Inconnu'}`,
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  openAddCommandeDialog(): void {
    const dialogRef = this.dialog.open(AddCommandeComponent, {
      width: '600px',
      height: '750px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.loadCommandes(); // 🔄 recharge la liste
        Swal.fire({
          title: 'Succès !',
          text: 'Commande ajoutée avec succès.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
      }
    });
  }
  
}
