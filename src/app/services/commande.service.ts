import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject, forkJoin  } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private commandeURL = 'http://localhost:8090/api/commandes/v1';
  
  constructor(private httpClient: HttpClient) {}

  private commandeUpdated = new Subject<void>();
  commandeUpdated$ = this.commandeUpdated.asObservable();
  private archivedCommandeIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  public archivedCommandeIds$ = this.archivedCommandeIdsSubject.asObservable();

  getAllCommandes(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.commandeURL).pipe(
      catchError(this.handleError<any[]>('getAllCommandes', []))
    );
  }

  getCommandesByUser(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.commandeURL}/mesCommandes`);
  }

  addCommande(commande: any): Observable<any> {
    return this.httpClient.post<any>(`${this.commandeURL}`, commande).pipe(
      catchError(this.handleError<any>('addCommande'))
    );
  }

  getTypeProduitsParCommande(idCommande: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`http://localhost:8090/commandes/${idCommande}/type-produits`).pipe(
      catchError(this.handleError<any[]>('getTypeProduitsParCommande', []))
    );
  }
  archiveCommandes(commandeIds: number[]): void {
    const currentArchived = this.archivedCommandeIdsSubject.value;
    commandeIds.forEach(id => currentArchived.add(id));
    this.archivedCommandeIdsSubject.next(currentArchived);
  }
  updateCommandesStatut(commandeIds: number[], nouveauStatut: string): Observable<any> {
    const requests = commandeIds.map(id =>
      this.httpClient.patch(`${this.commandeURL}/${id}/statut`, { statut: nouveauStatut })
    );
    return forkJoin(requests).pipe(
      tap(() => {
        this.archiveCommandes(commandeIds); // Archive after updating status
        this.commandeUpdated.next(); // Notify subscribers
      }),
      catchError(this.handleError<any>('updateCommandesStatut'))
    );
  }
  
  checkCodeCommandeExists(code: string) {
    return this.httpClient.get<any>(`${this.commandeURL}/check-code`, {
      params: { codeCommande: code }
    }).pipe(
      catchError(this.handleError<any>('checkCodeCommandeExists'))
    );
  }

updateCommande(commandeObj: any): Observable<any> {
  return this.httpClient.put<any>(`${this.commandeURL}/${commandeObj.id}`, commandeObj).pipe(
    tap(() => {
      // If quantite is updated, update commande_produits as well
      if (commandeObj.commandeProduits && commandeObj.commandeProduits.length > 0) {
        const cp = commandeObj.commandeProduits[0];
        this.httpClient.put<any>(`${this.commandeURL}/${commandeObj.id}/produits/${cp.id}`, cp).subscribe({
          error: err => console.error('Failed to update commande_produits:', err)
        });
      }
      this.commandeUpdated.next();
    }),
    catchError(this.handleError<any>('updateCommande'))
  );
}
  getCommandeById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.commandeURL}/${id}`).pipe(
      catchError(this.handleError<any>('getCommandeById'))
    );
  }

  deleteCommandeById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.commandeURL}/${id}`).pipe(
      catchError(this.handleError<void>('deleteCommandeById'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}