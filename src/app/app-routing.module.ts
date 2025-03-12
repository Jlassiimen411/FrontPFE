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
import { CategorieUserComponent } from './components/categorie-user/categorie-user.component';
import { CartComponent } from './components/cart/cart.component';
import { BuyProductComponent } from './components/buy-product/buy-product.component';

import { BuyProductResolverService } from './services/buy-product-resolver.service';
import { ProduitUserComponent } from './components/produit-user/produit-user.component';


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
  


  /////////////client///
  { path: 'categories', component: CategorieUserComponent },
  { path: 'produits_user/:typeId', component: ProduitUserComponent },
  { path: 'cart', component: CartComponent },
  { path: 'buyProduct', component: BuyProductComponent ,
  resolve:{
    productDetails:BuyProductResolverService
  }
}
 


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
