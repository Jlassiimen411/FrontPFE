import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompartimentService {

  private apiUrl = 'http://localhost:8080/api/compartiments'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  // Récupérer la liste des citernes
  getCiternes(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/citernes`); // Remplacez par votre endpoint réel
  }

  // Récupérer la liste des compartiments
  getCompartiments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  addCompartimentToCiterne(citerneId: number, compartiment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${citerneId}/compartiments`, compartiment);
  }

  
  addCompartiment(compartiment: any) {
    return this.http.post<any>(this.apiUrl, compartiment);
  }

  
  // Récupérer un compartiment par son ID
  getCompartiment(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un compartiment
  updateCompartiment(compartiment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${compartiment.id}`, compartiment);
  }

  // Supprimer un compartiment
  deleteCompartiment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

}