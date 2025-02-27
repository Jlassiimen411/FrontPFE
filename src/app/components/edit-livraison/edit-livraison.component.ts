import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';

@Component({
  selector: 'app-edit-livraison',
  templateUrl: './edit-livraison.component.html',
  styleUrls: ['./edit-livraison.component.css']
})
export class EditLivraisonComponent implements OnInit {
  livraisonId!: number;
  livraisonData: any = {};
  livraisonForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private livraisonService: LivraisonService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.livraisonId = this.route.snapshot.params['id'];
    this.livraisonForm = this.fb.group({
      dateLivraison: ['', Validators.required],
      statut: ['', Validators.required]
    });

    // Récupérer les données de la livraison depuis l'API
    this.livraisonService.getLivraisonById(this.livraisonId).subscribe(
      (res) => {
        console.log('Données reçues de l\'API:', res);
        this.livraisonData = res;

        // Remplir le formulaire avec les données de la livraison
        this.livraisonForm.patchValue({
          dateLivraison: this.livraisonData.dateLivraison,
          statut: this.livraisonData.statut
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des données de la livraison:', err);
      }
    );
  }

  editLivraison(): void {
    if (this.livraisonForm.valid) {
      const updatedLivraison = this.livraisonForm.value;

      // Mettre à jour la livraison avec les nouvelles données
      this.livraisonService.updateLivraison(this.livraisonId, updatedLivraison).subscribe(
        (res) => {
          console.log('Livraison mise à jour:', res);
          this.router.navigate(['/livraisons']);
        },
        (err) => {
          console.error('Erreur lors de la mise à jour de la livraison:', err);
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/livraisons']);
  }
}
