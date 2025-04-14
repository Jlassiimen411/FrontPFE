import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CamionService {

  private apiUrl = 'http://localhost:8080/api/camions'; // URL de ton API backend

  constructor(private http: HttpClient) { }

  // Récupérer tous les camions
  getCamions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getCamion(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un nouveau camion
  addCamion(camion: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, camion);
  }

  // Mettre à jour un camion existant
  updateCamion(camion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${camion.id}`, camion);
  }

  // Supprimer un camion
  deleteCamion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
    // Récupérer les informations du camion par ID de livraison
    getCamionByLivraisonId(livraisonId: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/${livraisonId}`);

}
getCiterneByImmatriculation(immatriculation: string) {
  return this.http.get<{id: number, reference: string}[]>(`/api/citernes/${immatriculation}`);
}


// Méthode dans le CamionService pour récupérer les camions par marque
// CamionService
getCamionsByMarque(marque: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/marques/${marque}`);
}



}
