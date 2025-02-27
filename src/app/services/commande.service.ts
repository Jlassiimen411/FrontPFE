import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private commandeURL: string = 'http://localhost:8080/api/commandes/v1';

  constructor(private httpClient: HttpClient) { }

  // Méthode pour récupérer toutes les commandes
  getAllCommandes(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.commandeURL).pipe(
      catchError(this.handleError<any[]>('getAllCommandes', []))
    );
  }

  addCommande(commandeObj: any): Observable<any> {
    return this.httpClient.post(this.commandeURL, commandeObj).pipe(
      catchError(this.handleError<any>('addCommande'))
    );
  }
  
  
  updateCommande(commandeObj: any): Observable<any> {
    const url = `${this.commandeURL}/${commandeObj.id}`;  // Ajoutez l'ID à l'URL pour la mise à jour
    return this.httpClient.put<any>(url, commandeObj).pipe(
      catchError(this.handleError<any>('update Commande'))
    );
  }
  

  
  // Méthode pour récupérer une commande par ID
  getCommandeById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.commandeURL}/${id}`).pipe(
      catchError(this.handleError<any>('getCommandeById'))
    );
  }

  // Méthode pour supprimer une commande par ID
  deleteCommandeById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.commandeURL}/${id}`).pipe(
      catchError(this.handleError<void>('deleteCommandeById'))
    );
  }

  // Gestion des erreurs génériques
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Retourne un résultat vide ou un résultat par défaut
      return of(result as T);
    };
  }
}
