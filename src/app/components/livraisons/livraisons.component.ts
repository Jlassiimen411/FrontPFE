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
      height: '55em',
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
        console.log('All deliveries:', data); // Check if id is present
        this.allLivraisons = data;
        this.calendarEvents = data.map((livraison: any) => ({
          title: `Livraison ${livraison.id}`,

          start: livraison.dateLivraison,
          description: livraison.statut,
          id: livraison.id, // id is included here
          extendedProps: {
            commandeId: livraison.commandeId,  // Ensure commandeId is correctly passed
            statut: livraison.statut           // Ensure statut is passed as well
          }
        }));
        
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Error loading livraisons', err);
      }
    });
  }
  

  // Mettre à jour les événements du calendrier après l'ajout de la livraison
  updateCalendarEvents(): void {
    this.calendarOptions.events = [...this.calendarEvents]; // Met à jour les événements
  }

  handleEventClick(clickInfo: any): void {
    const data = {
      livraisonId: clickInfo.event.id,  // Vérifiez que event.id contient bien l'ID de livraison
      commandeId: clickInfo.event.extendedProps.commandeId,
      dateLivraison: clickInfo.event.startStr,  
      statut: clickInfo.event.extendedProps.statut
    };
    console.log('Données envoyées au dialogue:', data); // Ajoutez un log pour vérifier les données
    
    const dialogRef = this.dialog.open(DialogLivraisonDetailsComponent, {
      width: '400px',
      data: data
    });
  }
  
  
  
}