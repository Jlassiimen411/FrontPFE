import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompartimentService {

  private apiUrl = 'http://localhost:8080/api/compartiments';

 
  constructor(private http: HttpClient) { }


  getCompartiments(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }


  

}