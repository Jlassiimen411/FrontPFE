import { Component, OnInit } from '@angular/core';
import { CommandeService } from 'src/app/services/commande.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mes-commandes',
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.css']
})
export class MesCommandesComponent implements OnInit {
  currentDate: Date = new Date();
  commandes: any[] = [];
  allMesCommandes: any[] = [];
  searchTerm: string = ''; // ce que l'utilisateur tape
  filteredMesCommandes: any[] = [];
  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.commandeService.getCommandesByUser().subscribe({
      next: (data) =>{
        this.commandes = data,
        this.allMesCommandes = data;
        this.filteredMesCommandes= data;

      } ,
      error: (err) => console.error('Erreur chargement commandes:', err)
    });
  }

  filterMesCommandes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredMesCommandes = this.allMesCommandes.filter((commande: any) =>
      commande.codeCommande?.toLowerCase().includes(term) ||
      commande.client?.fullName?.toLowerCase().includes(term) ||
      commande.commandeProduits?.some((cp: any) =>
        cp.produit?.nomProduit?.toLowerCase().includes(term)
      )
    );
  }
  deleteCommande(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commandeService.deleteCommandeById(id).subscribe({
          next: () => {
            // Supprimer localement la commande du tableau
            this.filteredMesCommandes = this.filteredMesCommandes.filter(c => c.id !== id);
            Swal.fire('Supprimée !', 'La commande a été supprimée.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible de supprimer la commande.', 'error');
          }
        });
      }
    });
  }
  
  
}
