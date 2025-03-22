import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid'; // Vue mensuelle
import timeGridPlugin from '@fullcalendar/timegrid'; // Vues hebdomadaire et quotidienne
import interactionPlugin from '@fullcalendar/interaction'; // Interaction utilisateur
import { FullCalendarModule } from '@fullcalendar/angular';
import { AddLivraisonComponent } from '../add-livraison/add-livraison.component';
import { LivraisonService } from 'src/app/services/livraison.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogLivraisonDetailsComponent } from '../dialog-livraison-details/dialog-livraison-details.component';

@Component({
  selector: 'app-livraisons',
  templateUrl: './livraisons.component.html',
  styleUrls: ['./livraisons.component.css']
})
export class LivraisonsComponent implements OnInit {
  public loading: boolean = false;
  allLivraisons: any = [];
 
  calendarEvents: Array<{ title: string, start: string, description: string }> = []; // Typage explicite des événements

  // Plugins FullCalendar utilisés
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];

  // Options du calendrier
  calendarOptions = {
    initialView: 'dayGridMonth', // Vue par défaut
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: this.calendarEvents, // Les événements des livraisons
    eventClick: this.handleEventClick.bind(this) // Binding pour gérer les clics sur les événements
  };

  constructor(
    private lService: LivraisonService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLivraisons(); // Charger les livraisons dès le début
  }

  // Ouvrir le dialog pour ajouter une livraison
  openAddLivraisonDialog(): void {
    const dialogRef = this.dialog.open(AddLivraisonComponent, {
      width: '30em',
      height: '41em',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadLivraisons(); // Recharger les livraisons après ajout
      }
    });
  }

  // Charger les livraisons et mettre à jour le calendrier
  loadLivraisons(): void {
    this.lService.getAllLivraisons().subscribe({
      next: (data) => {
        console.log('Livraisons récupérées :', data);
        this.allLivraisons = data;
  
        this.calendarEvents = data.map((livraison: any) => {
          console.log('Livraison spécifique:', livraison); // Inspecter la livraison
  
          return {
            title: `Livraison ${livraison.id}`,
            start: livraison.dateLivraison,
            description: livraison.statut,
            id: livraison.id,
            extendedProps: {
              commandeId: livraison.commandeId,
              statut: livraison.statut,
              marque: livraison.camion ? livraison.camion.marque : 'Non définie',
              immatriculation: livraison.camion ? livraison.camion.immatriculation : 'Non définie'
            }
          };
        });
  
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des livraisons :', err);
      }
    });
  }
  
  
  

  // Mettre à jour les événements du calendrier après l'ajout de la livraison
  updateCalendarEvents(): void {
    this.calendarOptions.events = [...this.calendarEvents]; // Met à jour les événements
  }

  handleEventClick(clickInfo: any): void {
    const data = {
      livraisonId: clickInfo.event.id,
      commandeId: clickInfo.event.extendedProps.commandeId,
      dateLivraison: clickInfo.event.startStr,
      statut: clickInfo.event.extendedProps.statut,
      marque: clickInfo.event.extendedProps.marque, // Marque ajoutée
      immatriculation: clickInfo.event.extendedProps.immatriculation // Immatriculation ajoutée
    };
  
    const dialogRef = this.dialog.open(DialogLivraisonDetailsComponent, {
      width: '600px',
      height: '310px',
      data: data // Données passées au composant de détails
    });
  }
  
  
  
  
}