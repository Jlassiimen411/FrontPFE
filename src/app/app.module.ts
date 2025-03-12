import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { SliderComponent } from './components/slider/slider.component';
import { DashReceptionnaireComponent } from './components/dash-receptionnaire/dash-receptionnaire.component';
import { Header2Component } from './components/header2/header2.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { LivraisonsComponent } from './components/livraisons/livraisons.component';
import { ReceptionnairePageComponent } from './components/receptionnaire-page/receptionnaire-page.component';
import { AddCommandeComponent } from './components/add-commande/add-commande.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AddLivraisonComponent } from './components/add-livraison/add-livraison.component';
import { FormsModule } from '@angular/forms';

import { AddProduitComponent } from './components/add-produit/add-produit.component';
import { EditProduitComponent } from './components/edit-produit/edit-produit.component';
import { EditCommandeComponent } from './components/edit-commande/edit-commande.component';
import { DialogLivraisonDetailsComponent } from './components/dialog-livraison-details/dialog-livraison-details.component';
import { EditLivraisonComponent } from './components/edit-livraison/edit-livraison.component';

import { AddTypeProduitComponent } from './components/add-type-produit/add-type-produit.component';
import { TypeProduitComponent } from './components/type-produit/type-produit.component';
import { EditTypeProduitComponent } from './components/edit-type-produit/edit-type-produit.component';
import { ProduitsParTypeComponent } from './components/produits-par-type/produits-par-type.component';
import { CategorieUserComponent } from './components/categorie-user/categorie-user.component';
import { CartComponent } from './components/cart/cart.component';

import { BuyProductComponent } from './components/buy-product/buy-product.component';
import { ProduitUserComponent } from './components/produit-user/produit-user.component';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    SliderComponent,
    DashReceptionnaireComponent,
    Header2Component,
    CommandesComponent,
    LivraisonsComponent,
    ReceptionnairePageComponent,
    AddCommandeComponent,
    AddLivraisonComponent,
    AddProduitComponent,
    EditProduitComponent,
    EditCommandeComponent,
    DialogLivraisonDetailsComponent,
    EditLivraisonComponent,
    TypeProduitComponent,
    EditTypeProduitComponent,
    AddTypeProduitComponent,
    ProduitsParTypeComponent,
    CategorieUserComponent,
    CartComponent,
    BuyProductComponent,
    ProduitUserComponent,
  
  
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FullCalendarModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    

    
    
    
  ],
  providers: [],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
