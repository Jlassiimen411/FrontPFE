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

        if (!this.commande.produits) {
          this.commande.produits = [];
        }

        // Initialisation du formulaire avec les données récupérées
        this.commandeForm.patchValue({
          numero: this.commande.numero,
          quantite: this.commande.quantite,
          dateCommande: this.commande.dateCommande
        });

        console.log('Produits :', this.commande.produits); // Vérifie que les produits sont bien récupérés
      },
      (err) => {
        console.error('Erreur lors de la récupération de la commande', err);
      }
    );
  }

  editCommande(): void {
    if (this.commandeForm.invalid) {
      alert("Tous les champs obligatoires doivent être remplis.");
      return;
    }
  
    // Assurez-vous que les produits ont un 'id' et que le champ 'name' a été modifié
    if (this.commande.produits) {
      this.commande.produits = this.commande.produits.map((produit: any) => {
        if (!produit.id || !produit.name) {
          alert("Chaque produit doit avoir un ID et un nom.");
          return;
        }
        return {
          id: produit.id,        // Assurez-vous que l'ID est inclus pour la mise à jour
          name: produit.name,    // Le nom modifié du produit
          description: produit.description, // Optionnel si tu modifies la description aussi
          price: produit.price,  // Prix du produit
          date: produit.date     // Date si nécessaire
        };
      });
    }
  
    // Création de l'objet de mise à jour de la commande
    const commandeToUpdate = {
      id: this.id,  // L'ID de la commande à mettre à jour
      numero: this.commandeForm.value.numero,
      quantite: this.commandeForm.value.quantite,
      dateCommande: this.commandeForm.value.dateCommande,
      produits: this.commande.produits  // Les produits mis à jour, avec l'ID
    };
  
    // Mise à jour via le service
    this.cService.updateCommande(commandeToUpdate).subscribe(
      (res) => {
        console.log('Commande mise à jour avec succès:', res);
        this.router.navigate(['/commandes']);  // Rediriger vers la liste des commandes
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la commande', error);
        alert("Une erreur est survenue lors de la mise à jour de la commande.");
      }
    );
  }
}  