import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Define status options as a constant
export const STATUS_OPTIONS = {
  EN_ATTENTE: { value: 'EN_ATTENTE', label: 'En Attente' },
  LIVRE: { value: 'LIVRE', label: 'Livré' },
  ANNULE: { value: 'ANNULE', label: 'Annulé' }
};

@Component({
  selector: 'app-edit-livraison',
  templateUrl: './edit-livraison.component.html',
  styleUrls: ['./edit-livraison.component.css']
})
export class EditLivraisonComponent implements OnInit {
  livraisonId!: number;
  livraisonData: any = {};
  livraisonForm!: FormGroup;
  livraisonCommandes: any[] = [];
  minDate: string;
  originalStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private livraisonService: LivraisonService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef // Added for change detection
  ) {
    this.minDate = this.formatDateToYYYYMMDD(new Date());
  }

  ngOnInit(): void {
    this.livraisonId = this.route.snapshot.params['id'];
    this.livraisonForm = this.fb.group({
      codeLivraison: ['', Validators.required],
      dateLivraison: ['', Validators.required],
      marque: ['', Validators.required],
      immatriculation: ['', Validators.required],
      statut: ['', Validators.required],
      reference: [{ value: '', disabled: true }, Validators.required],
      commandes: this.fb.array([])
    });

    this.loadLivraisonData();
  }

  private loadLivraisonData(): void {
    this.livraisonService.getLivraisonById(this.livraisonId).subscribe(
      (res) => {
        console.log('Données reçues de l\'API:', res);
        this.livraisonData = res;
        this.livraisonCommandes = this.livraisonData.commandes || [];
        this.originalStatus = (this.livraisonData.statut?.toUpperCase() || 'EN_ATTENTE'); // Fallback to EN_ATTENTE

        this.livraisonForm.patchValue({
          codeLivraison: this.livraisonData.codeLivraison,
          marque: this.livraisonData.camion?.marque,
          reference: this.livraisonData.camion?.citerne?.reference,
          immatriculation: this.livraisonData.camion?.immatriculation,
          dateLivraison: this.livraisonData.dateLivraison,
          statut: this.originalStatus
        });
        this.cdr.detectChanges(); // Ensure form updates are reflected
      },
      (err) => {
        console.error('Erreur lors de la récupération des données de la livraison:', err);
        this.snackBar.open('Erreur lors de la récupération des données', 'Fermer', { duration: 3000 });
      }
    );
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isStatusLocked(): boolean {
    return this.originalStatus === STATUS_OPTIONS.LIVRE.value;
  }

  getAvailableStatusOptions(): { value: string, label: string }[] {
    const allOptions = [
      STATUS_OPTIONS.EN_ATTENTE,
      STATUS_OPTIONS.LIVRE,
      STATUS_OPTIONS.ANNULE
    ];

    if (this.isStatusLocked()) {
      return [STATUS_OPTIONS.LIVRE];
    }

    return allOptions;
  }

  editLivraison(): void {
    if (this.livraisonForm.valid) {
      const formValue = this.livraisonForm.getRawValue();
      const newStatus = formValue.statut.toUpperCase();

      if (this.originalStatus === STATUS_OPTIONS.LIVRE.value && 
          (newStatus === STATUS_OPTIONS.EN_ATTENTE.value || newStatus === STATUS_OPTIONS.ANNULE.value)) {
        this.snackBar.open('Impossible de modifier un statut "Livré" vers "En Attente" ou "Annulé".', 'Fermer', { duration: 3000 });
        return;
      }

      const updatedLivraison = {
        id: this.livraisonId,
        codeLivraison: formValue.codeLivraison,
        dateLivraison: formValue.dateLivraison,
        statut: newStatus,
        commandes: this.livraisonData.commandes,
        camion: this.livraisonData.camion
      };

      this.livraisonService.updateLivraison(this.livraisonId, updatedLivraison).subscribe(
        (res) => {
          console.log('Livraison mise à jour:', res);
          this.originalStatus = newStatus;
          this.livraisonData.statut = newStatus;

          this.livraisonForm.patchValue({
            statut: newStatus
          });
          this.cdr.detectChanges(); // Force view update

          if (newStatus === STATUS_OPTIONS.ANNULE.value) {
            this.livraisonService.notifyCalendarUpdate(this.livraisonId, 'remove');
            this.snackBar.open('Livraison annulée et supprimée du calendrier.', 'Fermer', { duration: 3000 });
          } else {
            this.livraisonService.notifyCalendarUpdate(this.livraisonId, 'update');
            this.snackBar.open(`Livraison mise à jour avec succès. Nouveau statut : ${this.getStatusLabel(newStatus)}.`, 'Fermer', { duration: 3000 });
          }

          this.router.navigate(['/livraisons']);
        },
        (err) => {
          console.error('Erreur lors de la mise à jour de la livraison:', err);
          this.snackBar.open('Erreur lors de la mise à jour de la livraison.', 'Fermer', { duration: 3000 });
        }
      );
    } else {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
    }
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      [STATUS_OPTIONS.EN_ATTENTE.value]: STATUS_OPTIONS.EN_ATTENTE.label,
      [STATUS_OPTIONS.LIVRE.value]: STATUS_OPTIONS.LIVRE.label,
      [STATUS_OPTIONS.ANNULE.value]: STATUS_OPTIONS.ANNULE.label
    };
    return statusMap[status] || status;
  }

  cancel(): void {
    this.router.navigate(['/livraisons']);
  }
}