import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CiterneService {
  private baseUrl = 'http://localhost:8080/api/citernes';

  constructor(private http: HttpClient) {}

  getCiternes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getCiterne(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  addCiterne(citerne: any): Observable<any> {
    return this.http.post(this.baseUrl, citerne);  // Utilisation de this.baseUrl
  }
  

  updateCiterne(citerne: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${citerne.id}`, citerne);
  }

  deleteCiterne(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  getCompartimentsByCiterneId(citerneId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/citerne/${citerneId}`);
  }
  


}