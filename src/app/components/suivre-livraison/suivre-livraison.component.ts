import { Component, OnInit } from '@angular/core';
import { LivraisonService } from 'src/app/services/livraison.service'; // ajuste le chemin si besoin
import { ActivatedRoute } from '@angular/router';
import { TypeProduit } from '../add-livraison/add-livraison.component';
import { TypeProduitService } from 'src/app/services/type-produit.service';

@Component({
  selector: 'app-suivre-livraison',
  templateUrl: './suivre-livraison.component.html',
  styleUrls: ['./suivre-livraison.component.css']
})
export class SuivreLivraisonComponent implements OnInit {
  livraisons: any[] = [];
  username: string = '';
  typesProduits: any[] = [];
  
  // Nouvelle propriété pour stocker les livraisons avec commandes filtrées
  livraisonsFiltres: any[] = [];

  constructor(private lService: LivraisonService, private typeProduitService: TypeProduitService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    console.log("Nom d'utilisateur :", this.username);
  
    if(this.username) {
      this.getLivraisons();
    } else {
      console.error("Username non défini !");
    }
  }
  
  loadTypesProduits(): void {
    this.typeProduitService.getAllTypeProduitsAvecProduits().subscribe({
      next: (data) => {
        console.log('Réponse reçue : ', data);
        this.typesProduits = data;
      },
      error: (err) => console.error(err)
    });
  }

  getLivraisons(): void {
    this.lService.getLivraisonsByUser(this.username).subscribe({
      next: (livraisons) => {
        this.livraisons = livraisons;
  
        const livraisonsAvecProduitsLivres: any[] = [];
  
        this.livraisons.forEach((livraison) => {
          const commandesFiltrees = livraison.commandes.filter((cmd: any) => cmd.user?.userName === this.username);
  
          if (commandesFiltrees.length > 0) {
            livraison.commandes = commandesFiltrees;
  
            // Récupérer les produits livrés pour la livraison
            this.lService.getProduitsLivresParLivraison(livraison.id).subscribe({
              next: (produitsLivres) => {
                console.log(`Produits livrés pour la livraison ${livraison.id}:`, produitsLivres);
                livraison.produitsLivres = produitsLivres;
              },
              error: () => {
                livraison.produitsLivres = [];
              }
            });
            
  
            livraisonsAvecProduitsLivres.push(livraison);
          }
        });
  
        this.livraisonsFiltres = livraisonsAvecProduitsLivres;
      },
      error: (err) => console.error(err)
    });
  }
  

  
  
  
  
}  


