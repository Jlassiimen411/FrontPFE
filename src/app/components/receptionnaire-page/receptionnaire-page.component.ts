import { Component, OnInit } from '@angular/core';
import { ReceptionnairePageService } from 'src/app/services/receptionnaire-page.service';

@Component({
  selector: 'app-receptionnaire-page',
  templateUrl: './receptionnaire-page.component.html',
  styleUrls: ['./receptionnaire-page.component.css']
})
export class ReceptionnairePageComponent implements OnInit {
  allTypeProduits: any[] = [];
  allProduits: any[] = [];
  allCommandes: any[] = [];
  calendarOptions: { events: any[] } = { events: [] };

  constructor(private receptionnaireService: ReceptionnairePageService) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadCommandes();
    this.loadCalendarEvents();
    this.loadTypeProduits();
  }

  loadTypeProduits(): void {
    this.receptionnaireService.getAllTypeProduits().subscribe(
      (data: any[]) => this.allTypeProduits = data,
      (error) => console.error('Erreur de chargement des produits', error)
    );
  }
  loadProduits(): void {
    this.receptionnaireService.getAllProduits().subscribe(
      (data: any[]) => this.allProduits = data,
      (error) => console.error('Erreur de chargement des produits', error)
    );
  }

  loadCommandes(): void {
    this.receptionnaireService.getAllCommandes().subscribe(
      (data: any[]) => this.allCommandes = data,
      (error) => console.error('Erreur de chargement des commandes', error)
    );
  }

  loadCalendarEvents(): void {
    this.receptionnaireService.getCalendarEvents().subscribe(
      (data: any[]) => this.calendarOptions.events = data, // ✅ Correction ici
      (error) => console.error('Erreur de chargement des événements', error)
    );
  }
}
