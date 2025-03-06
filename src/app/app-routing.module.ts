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

import { ProduitsParTypeComponent } from './components/produits-par-type/produits-par-type.component';
import { AddProduitComponent } from './components/add-produit/add-produit.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'receptionnairepage', component: ReceptionnairePageComponent },
  { path: 'commandes', component: CommandesComponent },
  

  { path: 'produits/:id', component: ProduitsParTypeComponent },

  { path: 'livraisons', component: LivraisonsComponent },
  { path: 'addcommande', component: AddCommandeComponent },
  { path: 'addlivraison', component: AddLivraisonComponent },
  { path: 'editcommande/:id', component: EditCommandeComponent },
  { path: 'editproduit/:id', component: EditProduitComponent },
  { path: 'edit-livraison/:id', component: EditLivraisonComponent },
  { path: 'type_produit', component: TypeProduitComponent },

  { path: 'edit_type_produit/:id', component: EditTypeProduitComponent },

  { path: 'addProduit/:typeId', component: AddProduitComponent },

 

  { path: '**', redirectTo: '' } // Redirection si la route est inconnue
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
