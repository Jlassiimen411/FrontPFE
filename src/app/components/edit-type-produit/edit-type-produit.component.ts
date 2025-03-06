import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeProduitService } from 'src/app/services/type-produit.service';

@Component({
  selector: 'app-edit-type-produit',
  templateUrl: './edit-type-produit.component.html',
  styleUrls: ['./edit-type-produit.component.css']
})
export class EditTypeProduitComponent implements OnInit {
  typeProduit: any = {};  
  id!: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private pService: TypeProduitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.activatedRoute.snapshot.params['id']);
    console.log("ID récupéré depuis l'URL :", this.id);
  
    if (!this.id) {
      console.error("Erreur : ID du produit invalide !");
      return;
    }
  
    this.pService.getTypeProduitById(this.id).subscribe(
      (res) => {
        console.log('Données récupérées du backend :', res);
        if (!res) {
          console.error("Erreur : Produit introuvable !");
          return;
        }
        this.typeProduit = res;
  
        if (this.typeProduit && this.typeProduit.date) {
          // Reformatting the date to "yyyy-MM-dd"
          const date = new Date(this.typeProduit.date);
          this.typeProduit.date = date.toISOString().split('T')[0];  // Converts to yyyy-MM-dd format
        }
      },
      (err) => {
        console.error('Erreur lors de la récupération du type produit :', err);
      }
    );
  }
  
  
  editTypeProduit() {
    if (this.typeProduit.date) {
      // Formatage de la date pour s'assurer qu'elle est dans le bon format
      const formattedDate = new Date(this.typeProduit.date).toISOString().split('T')[0];
      this.typeProduit.date = formattedDate;
    }
  
    console.log("Données envoyées pour mise à jour :", this.typeProduit);
  
    this.pService.updateTypeProduit(this.typeProduit).subscribe(
      (res) => {
        console.log('Type Produit mis à jour avec succès:', res);
        this.router.navigate(['/type_produit']);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du type de produit', error);
      }
    );
  }
  
  
  
  
}  