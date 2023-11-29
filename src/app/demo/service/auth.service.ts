import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthStatus, LoginResponse, User } from '../interfaces';
import { checkTokenResponse } from '../interfaces/check-token.response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(this.retrieveUserFromStorage());
  currentUser: Observable<User | null> = this._currentUser.asObservable();
  private _authStatus: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(this.retrieveAuthStatusFromStorage());
  authStatus: Observable<AuthStatus> = this._authStatus.asObservable();

  constructor(private http: HttpClient) {
    // Ejecutar inmediatamente al cargar la aplicación
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication(user: User, token: string): void {
    this._currentUser.next(user);
    this._authStatus.next(AuthStatus.authenticated);

    // Almacena el usuario y el estado de autenticación en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authStatus', AuthStatus.authenticated);
  }

  login(correo: string, contrasena: string): Observable<boolean> {
    console.log('Attempting login...');
    const url = `https://api-postgress.onrender.com/api/usuarios/login`;
    //  const url='http://localhost:8080/api/usuarios/login';
    
    const body = { correo, contrasena };

    return this.http.post<LoginResponse>(url, body).pipe(
      map(response => this.handleLoginResponse(response)),
      catchError((error: any) => this.handleError(error))
    );
  }

  private handleLoginResponse(response: any): boolean {
    if (response && response.usuario && response.token) {
      this.setAuthentication(response.usuario, response.token);
      console.log('Login successful:', response.message);
      return true;
    } else {
      console.error('Error: Invalid server response.');
      return false;
    }
  }
  
  private handleError(error: any): Observable<any> {
    let errorMessage = 'Error durante el inicio de sesión'; // Mensaje predeterminado
  
    if (error instanceof HttpErrorResponse) {
      console.error('HTTP Error:', error.status, error.statusText);
  
      if (error.status === 400) {
        // Verificar si el mensaje de error es por "El usuario está inactivo."
        if (error.error && error.error.error === 'El usuario está inactivo.') {
            // Puedes retornar un objeto con información adicional
            return throwError({
                message: error.error.error,
                errorType: 'inactiveUser', // Añadimos un tipo para identificar el error
            });
        }
    }
  
      if (error.status === 401) {
        console.log('No autorizado - Redireccionando a la página de inicio de sesión...');
        errorMessage = 'Usuario o contraseña incorrectos.';
      }
    } else if (error && error.error && error.error.error) {
      console.error('Server Error:', error.error.error);
      errorMessage = error.error.error;
    } else {
      console.error('Se produjo un error inesperado:', error);
    }
  
    return throwError(() => errorMessage);
  }
  

  checkAuthStatus(): Observable<User | null> {
    console.log('Checking authentication status...');
  
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.log('No token found. Not authenticated.');
      this._authStatus.next(AuthStatus.notAuthenticated);
      return of(null);
    }
  
    const url = `https://api-postgress.onrender.com/api/ruta-protegida`;
    const headers = new HttpHeaders().set('x-token', token);
  
    return this.http.get<checkTokenResponse>(url, { headers }).pipe(
      map(({ user, token: newToken }) => {
        // Actualiza el token en localStorage
        localStorage.setItem('token', newToken);
        // Actualiza la información del usuario
        this.setAuthentication(user, newToken);
        return user;
      }),
      catchError(() => {
        this._authStatus.next(AuthStatus.notAuthenticated);
        return of(null);
      })
    );
  }

  logout() {
    console.log('Logging out...');
    this._currentUser.next(null);
    this._authStatus.next(AuthStatus.notAuthenticated);
  
    // Elimina las entradas de localStorage relacionadas con la autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authStatus');
  }

  private retrieveUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private retrieveAuthStatusFromStorage(): AuthStatus {
    const authStatus = localStorage.getItem('authStatus');
    return authStatus ? (authStatus as AuthStatus) : AuthStatus.checking;
  }
}
