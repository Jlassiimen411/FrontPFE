import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { LivraisonsComponent } from './components/livraisons/livraisons.component';
import { ReceptionnairePageComponent } from './components/receptionnaire-page/receptionnaire-page.component';
import { AddCommandeComponent } from './components/add-commande/add-commande.component';

import { EditProduitComponent } from './components/edit-produit/edit-produit.component';
import { EditCommandeComponent } from './components/edit-commande/edit-commande.component';
import { AddLivraisonComponent } from './components/add-livraison/add-livraison.component';
import { EditLivraisonComponent } from './components/edit-livraison/edit-livraison.component';
import { TypeProduitComponent } from './components/type-produit/type-produit.component';
import { EditTypeProduitComponent } from './components/edit-type-produit/edit-type-produit.component';
import { ProduitsComponent } from './components/produits/produits.component';






const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'receptionnairepage', component: ReceptionnairePageComponent},
  { path: 'commandes', component: CommandesComponent },
  
  { path: 'produits/:typeId', component: ProduitsComponent },

  { path: 'livraisons', component: LivraisonsComponent },
  { path: 'addcommande', component: AddCommandeComponent },
  { path: 'addlivraison', component: AddLivraisonComponent },
  { path: 'editcommande/:id', component: EditCommandeComponent },
  { path: 'editproduit/:id', component: EditProduitComponent },
  { path: 'edit-livraison/:id', component: EditLivraisonComponent },
  { path: 'type_produit', component: TypeProduitComponent },
  { path: 'edit_type_produit/:id', component: EditTypeProduitComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
