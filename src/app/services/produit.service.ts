import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private produitURL: string = 'http://localhost:8081/api/produits/v1';


  constructor(private httpClient: HttpClient) {}

  //Méthode pour récupérer toutes les commandes
  getAllProduits(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.produitURL).pipe(
      catchError(this.handleError<any[]>('getAllProduit', []))
    );
  } 
  


  addProduit(produit: any): Observable<any> {
    return this.httpClient.post(this.produitURL, produit);
  }
  
  updateProduit(produitObj: any): Observable<any> {
    return this.httpClient.put<any>(this.produitURL, produitObj).pipe(
      catchError(this.handleError<any>('updateProduit'))  // Corrected here
    );
  }
  


  getProduitById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.produitURL}/${id}`).pipe(
      catchError(this.handleError<any>('getProduitById'))
    );
  }

  
  deleteProduitById(id: number): Observable<void> {
    console.log('Envoi de la requête DELETE pour le produit ID:', id);
    return this.httpClient.delete<void>(`${this.produitURL}/${id}`).pipe(
      catchError((error) => {
        console.error('Échec de la suppression', error);
        return throwError(() => new Error('Échec de la suppression'));
      })
    );
  }
  

  getProduitsByType(typeId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.produitURL}/type/${typeId}`).pipe(
      tap(() => console.log(`Produits du type ${typeId} chargés`)),
      catchError(this.handleError<any[]>('getProduitsByType', []))
    );
  }
  

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Log des détails de l'erreur
      console.error('Details de l\'erreur:', error);
      return of(result as T);
    };
  }


  
}
