import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { ProduitService } from 'src/app/services/produit.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private produitService: ProduitService,
    private router: Router,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(
      data => {
        this.cartItems = data.map((item: any) => ({
          product: item.product,
          quantity: item.quantity || 1
        }));
        this.getTotalPrice();  // Calculer le total au chargement
      },
      error => {
        console.error("Erreur de récupération du panier", error);
      }
    );
  }

  updateQuantity(codeProduit: number, quantity: number): void {
    if (quantity > 0) {
      const item = this.cartItems.find(item => item.product.codeProduit === codeProduit);
      if (item) {
        item.quantity = quantity;
        this.cartItems = [...this.cartItems];  // Crée une nouvelle référence pour forcer Angular à détecter les changements
        this.getTotalPrice();  // Recalcule le total
      }
    } else {
      alert("La quantité ne peut pas être inférieure à 1");
    }
  }

  getTotalPrice(): void {
    this.total = this.cartItems.reduce((acc, item) => acc + (item.product.prix * item.quantity), 0);
    console.log("Total recalculé : ", this.total);
    this.cdr.detectChanges();  // Force la détection des changements
  }

  removeItem(id: number): void {
    console.log("ID envoyé pour suppression :", id);  // 🔍 Ajoute ce log
    if (!id) {
      console.error("ID invalide !");
      return;
    }
  
    this.cartService.removeFromCart(id).subscribe(
      (response) => {
        console.log('Réponse du backend:', response);
        this.cartItems = this.cartItems.filter(item => item.product.id !== id);

        this.getTotalPrice();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la suppression :', error);
      }
    );
  }
  

  

  checkout() {
    this.router.navigate(['/buyProduct', { isSingleProductCheckout: false, id: 0 }]);
  }
}
