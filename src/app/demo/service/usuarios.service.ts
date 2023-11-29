import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiUsuariosService {


  constructor(private http: HttpClient) {
  }

//  baseUrl = 'http://localhost:8080/api/usuarios'

//   private getHeaders(token?: string): HttpHeaders | undefined {
//     return token ? new HttpHeaders().set('x-token', token) : undefined;
//   }

//   //local
//   getUsuarios(token?: string): Observable<any[]> {
//     return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders(token) });
//   }
    
//   public updateUserState(userId: number, newState: boolean, token?: string): Observable<any> {
//       const updateUrl = `${this.baseUrl}/estado/${userId}`;
//       const body = { estado: newState };
//       const headers = this.getHeaders(token);
//       return this.http.put(updateUrl, body, { headers });
//   }

//     public createUser(user: any, token?:string): Observable<any> {
//       const headers = token ? new HttpHeaders().set('x-token', token) : undefined; this.baseUrl;
//       return this.http.post(this.baseUrl, user , { headers });
//     }

//     getUsuariosActivos(token?: string): Observable<any[]> {
//       const headers = this.getHeaders(token);
//       const url = `${this.baseUrl}-activos`;
//       return this.http.get<any[]>(url, { headers });
//     }
    
//     getUsuariosInactivos(token?: string): Observable<any[]> {
//       const headers = this.getHeaders(token);
//       const url = `${this.baseUrl}-inactivos`;
//       return this.http.get<any[]>(url, { headers });
//     }
//     public verificarCorreoExistente(correo: string, token?:string): Observable<any> {
//       const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//       const verificarCorreo = `${this.baseUrl}-correo?correo=${correo}`;
//       return this.http.get<any>(verificarCorreo, { headers });
//     }
   

//     public updateUser(id: number, user: any, token?: string): Observable<any> {
//       const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//       const updateUser = `${this.baseUrl}/${id}`;
//       return this.http.put(updateUser, user, { headers });
//     }

//     public getUserById(userId: number ,token?: string): Observable<any> {
//       const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//       const getUserId = `${this.baseUrl}/${userId}`;
//       return this.http.get<any>(getUserId, { headers });
//     }

//     public changePassword(token: string, newPassword: string): Observable<any> {
//       const createUrl = `http://localhost:8080/api/cambiar-contrasena/${token}`;
//       const user = { newPassword };  // Puedes ajustar la estructura del objeto según sea necesario
//       return this.http.post(createUrl, user);
//     }

//   public forgotPassword(correo: any): Observable<any> {
//     const createUrl= 'http://localhost:8080/api/usuarios/recuperar';
//   return this.http.post(createUrl, correo);
//   }

Render

  baseUrl = 'https://api-postgress.onrender.com/api/usuarios'

  private getHeaders(token?: string): HttpHeaders | undefined {
    return token ? new HttpHeaders().set('x-token', token) : undefined;
  }

  getUsuarios(token?: string): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders(token) });
  }
    
  public updateUserState(userId: number, newState: boolean, token?: string): Observable<any> {
      const updateUrl = `${this.baseUrl}/estado/${userId}`;
      const body = { estado: newState };
      const headers = this.getHeaders(token);
      return this.http.put(updateUrl, body, { headers });
  }

    public createUser(user: any, token?:string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined; this.baseUrl;
      return this.http.post(this.baseUrl, user , { headers });
    }

    getUsuariosActivos(token?: string): Observable<any[]> {
      const headers = this.getHeaders(token);
      const url = `${this.baseUrl}-activos`;
      return this.http.get<any[]>(url, { headers });
    }
    
    getUsuariosInactivos(token?: string): Observable<any[]> {
      const headers = this.getHeaders(token);
      const url = `${this.baseUrl}-inactivos`;
      return this.http.get<any[]>(url, { headers });
    }
    public verificarCorreoExistente(correo: string, token?:string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      const verificarCorreo = `${this.baseUrl}-correo?correo=${correo}`;
      return this.http.get<any>(verificarCorreo, { headers });
    }
   

    public updateUser(id: number, user: any, token?: string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      const updateUser = `${this.baseUrl}/${id}`;
      return this.http.put(updateUser, user, { headers });
    }

    public getUserById(userId: number ,token?: string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      const getUserId = `${this.baseUrl}/${userId}`;
      return this.http.get<any>(getUserId, { headers });
    }

    public changePassword(token: string, newPassword: string): Observable<any> {
      const createUrl = `https://api-postgress.onrender.com/api/cambiar-contrasena/${token}`;
      const user = { newPassword };  // Puedes ajustar la estructura del objeto según sea necesario
      return this.http.post(createUrl, user);
    }

  public forgotPassword(correo: any): Observable<any> {
    const createUrl= 'https://api-postgress.onrender.com/api/usuarios/recuperar';
  return this.http.post(createUrl, correo);
  }

}
