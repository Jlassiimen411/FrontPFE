import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { LivraisonsComponent } from './components/livraisons/livraisons.component';
import { ReceptionnairePageComponent } from './components/receptionnaire-page/receptionnaire-page.component';
import { AddCommandeComponent } from './components/add-commande/add-commande.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { EditProduitComponent } from './components/edit-produit/edit-produit.component';
import { EditCommandeComponent } from './components/edit-commande/edit-commande.component';
import { AddLivraisonComponent } from './components/add-livraison/add-livraison.component';
import { EditLivraisonComponent } from './components/edit-livraison/edit-livraison.component';




const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'receptionnairepage', component: ReceptionnairePageComponent},
  { path: 'commandes', component: CommandesComponent },
  { path: 'produits', component: ProduitsComponent },
  { path: 'livraisons', component: LivraisonsComponent },
  { path: 'addcommande', component: AddCommandeComponent },
  { path: 'addlivraison', component: AddLivraisonComponent },
  { path: 'editcommande/:id', component: EditCommandeComponent },
  { path: 'editproduit/:id', component: EditProduitComponent },
  { path: 'edit-livraison/:id', component: EditLivraisonComponent },
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
