import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdresseService {

  constructor(private http: HttpClient) {}
  //cette methode prend l'adresse sous forme texte et returrne la reponse du backend 

  validateAddress(address: string): Observable<any> {
    const url = `http://localhost:8090/api/geocode?address=${encodeURIComponent(address)}`;
    return this.http.get(url).pipe(
      //transformer les données recues du backend
      map((result: any) => {
        console.log('Réponse backend geocode :', result); 
        if (result && result.latitude && result.longitude) {
          return {
            latitude: parseFloat(result.latitude),
            longitude: parseFloat(result.longitude)
          };
        } else {
          console.error('Aucun résultat pour l’adresse :', address);
          return null;
        }
      })
    );
  }}
