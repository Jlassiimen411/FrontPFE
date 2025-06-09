import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAuthService } from './user-auth.service';
import { Observable } from 'rxjs'; 
import { User } from '../model/user';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly API = "http://localhost:8090";

  constructor(
    private httpclient: HttpClient,
    private userAuthService: UserAuthService
  ) {}
  getCurrentUserProfile(): Observable<User> {
    return this.httpclient.get<User>(`${this.API}/profile`);
  }

  updateUserProfile(user: User): Observable<User> {
    return this.httpclient.put<User>(`${this.API}/profile`, user);
  }

  // Méthode pour récupérer les en-têtes avec ou sans Auth
  private getHeaders(withAuth: boolean): HttpHeaders {
    let headers = new HttpHeaders();
    if (withAuth) {
      const token = this.userAuthService.getToken(); // Récupérer le token JWT
      if (token) {
        headers = headers.set("Authorization", `Bearer ${token}`); // Ajouter l'en-tête Authorization
      }
    } else {
      headers = headers.set("No-Auth", "True"); // Ajouter un en-tête No-Auth pour les requêtes publiques
    }
    return headers;
  }

  // ✅ Inscription
  public register(registerData: any) {
    return this.httpclient.post(`${this.API}/register`, registerData, {
      headers: this.getHeaders(false) // Pas besoin de token pour l'inscription
    });
  }
  
  // ✅ Connexion
  public login(loginData: any) {
    return this.httpclient.post(`${this.API}/authenticate`, loginData, {
      headers: this.getHeaders(false) // Pas besoin de token pour la connexion
    });
  }

  // ✅ Récupération des rôles
  public getAllRoles() {
    return this.httpclient.get<string[]>(`${this.API}/roles`, {
      headers: this.getHeaders(false) // Authentification nécessaire pour récupérer les rôles
    });
  }
  public getUsersByRole(roleName: string): Observable<any[]> {
    return this.httpclient.get<any[]>(`${this.API}/users/byRole/${roleName}`, {
     
    });
  }
  
  // ✅ Vérification des rôles
  public roleMatch(allowedRoles: string[]): boolean {
    const userRoles = this.userAuthService.getRoles(); // string[]
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    return userRoles.some(role => allowedRoles.includes(role));
  }
  deleteUser(userName: string): Observable<any> {
    return this.httpclient.delete(`${this.API}/${userName}`, {
      headers: this.getHeaders(true)  // Auth requise pour supprimer
    });
  }
  sendResetLink(email: string): Observable<any> {
    return this.httpclient.post(`${this.API}/request-reset`, { email });
  }
  resetPassword(data: { token: string, newPassword: string }): Observable<any> {
    return this.httpclient.post(`${this.API}/reset-password`, data);
  }
  
  
  
}
