import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService  {

  private livraisonURL: string = 'http://localhost:8080/api/livraisons';

  constructor(private httpClient: HttpClient) { }

  getAllLivraisons(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.livraisonURL).pipe(
      catchError(this.handleError<any[]>('getAllLivraison', []))
    );
  }

  addLivraison(livraison: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    this.httpClient.post('http://localhost:8080/api/livraisons', livraison, { headers })
      .subscribe(response => {
        console.log('Livraison ajoutée', response);
      }, error => {
        console.error('Erreur lors de l\'ajout de la livraison', error);
      });
  }
  
  
  
  updateLivraison(id: number, livraisonData: any): Observable<any> {
    const url = `${this.livraisonURL}/${id}`;  // Assure-toi que l'ID est dans l'URL
    return this.httpClient.put<any>(url, livraisonData).pipe(
      catchError(this.handleError<any>('updateLivraison'))
    );
  }

  getLivraisonById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.livraisonURL}/${id}`).pipe(
      catchError(this.handleError<any>('getLivraisonById'))
    );
  }

  deleteLivraisonById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.livraisonURL}/${id}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression de la livraison:', error);
        return throwError(() => new Error('Une erreur est survenue lors de la suppression de la livraison.'));
      })
    );
  }
  

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
