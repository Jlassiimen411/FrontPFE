import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommandeService } from 'src/app/services/commande.service';

@Component({
  selector: 'app-edit-commande',
  templateUrl: './edit-commande.component.html',
  styleUrls: ['./edit-commande.component.css']
})
export class EditCommandeComponent implements OnInit {
  commandeForm: FormGroup;  // Formulaire réactif pour la commande
  commande: any = {};
  id!: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cService: CommandeService,
    private router: Router,
    private formBuilder: FormBuilder  // Injection du formBuilder
  ) {
    // Initialisation du formulaire
    this.commandeForm = this.formBuilder.group({
      numero: ['', Validators.required],
      quantite: ['', [Validators.required, Validators.min(1)]],
      dateCommande: ['', Validators.required],
      produits: [[]]  // Produits par défaut, tu pourrais avoir une logique de validation plus avancée ici
    });
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
  
    this.cService.getCommandeById(this.id).subscribe(
      (res) => {
        console.log('Commande récupérée :', res);
        this.commande = res;
  
        // Si les produits ne sont pas définis, initialiser à un tableau vide
        if (!this.commande.produits) {
          this.commande.produits = [];
        }
  
        // Initialisation du formulaire avec les données récupérées
        this.commandeForm.patchValue({
          numero: this.commande.numero,
          quantite: this.commande.quantite,
          dateCommande: this.commande.dateCommande,
          price: this.commande.price
        });
  
        console.log('Produits récupérés :', this.commande.produits); // Vérifier si les produits sont récupérés correctement
      },
      (err) => {
        console.error('Erreur lors de la récupération de la commande', err);
      }
    );
  }
  

  editCommande(): void {
    console.log('Commande à éditer:', this.commande); // Vérifier si le produit a bien un nom
    if (this.commandeForm.invalid) {
      alert("Tous les champs obligatoires doivent être remplis.");
      return;
    }
  
    // Vérifier si les produits existent et qu'ils ont un ID et un nom
    if (this.commande.produits && this.commande.produits.length > 0) {
      this.commande.produits = this.commande.produits.map((produit: any) => {
        // Vérifie si l'id et le nom du produit existent
        if (!produit.id || !produit.nomProduit) {
          alert("Chaque produit doit avoir un ID et un nom.");
          return produit;  // Retourne le produit sans modification si manquant
        }
        
        // Si tous les champs sont valides, retourne un produit mis à jour
        return {
          id: produit.id,
          nomProduit: produit.nomProduit,  // Assurez-vous que le champ est 'nomProduit' dans votre modèle
          description: produit.description,
          price: produit.prix,  // Remplace 'prix' par le bon champ si nécessaire
          date: produit.date
        };
      });
    } else {
      alert("Aucun produit trouvé pour cette commande.");
      return;
    }
  
    // Continuer avec la mise à jour de la commande...
    this.cService.updateCommande(this.commande).subscribe(
      (response) => {
        console.log('Commande mise à jour avec succès:', response);
        alert("Commande mise à jour avec succès !");
        this.router.navigate(['/commandes']); // Redirige vers la liste des commandes
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        alert("Une erreur est survenue lors de la mise à jour de la commande.");
      }
    );
  }
  
}  