import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ApiClientesService {

  
  constructor(private http: HttpClient) {}

  //private baseUrl='http://localhost:8080/api/clientes'


  //Local 

//   public getClientes(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     return this.http.get<any>(this.baseUrl, { headers });
//   }

//   public updateUserState(clientId: number, newState: boolean, token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const updateUrl = `${this.baseUrl}/estado/${clientId}`;
//     const body = { estado: newState };
//       return this.http.put(updateUrl, body, { headers });
//   }

//   public createClient(client: any, token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//    return this.http.post(this.baseUrl, client, { headers });
//  }

//  getClientesActivos(token?:string) {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const urlActivos=`${this.baseUrl}-activos`;
//   return this.http.get(urlActivos, { headers });
// }

// getClientesInactivos(token?:string) {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const urlActivos=`${this.baseUrl}-inactivos`;
//   return this.http.get(urlActivos, { headers });
// }

// public verificarCorreoExistente(correo: string, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const urlVerificarCorreo = `${this.baseUrl}-correo?correo=${correo}`;
//   return this.http.get<any>(urlVerificarCorreo, { headers });
// }

// public verificarTelefonoExistente(telefono: string, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const urlVerificarTelefono = `${this.baseUrl}-telefono?telefono=${telefono}`;
//   return this.http.get<any>(urlVerificarTelefono, { headers });
// }


// public updateCliente(id: number, client: any, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const updateUrl = `${this.baseUrl}/${id}`;
//   return this.http.put(updateUrl, client, { headers });
// }

// public getClientById(clientId: number, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const getClientUrl = `${this.baseUrl}/${clientId}`;
//   return this.http.get<any>(getClientUrl, { headers });
// }

//Render 

private baseUrl='https://api-postgress.onrender.com/api/clientes'

  public getClientes(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.get<any>(this.baseUrl, { headers });
  }

  public updateUserState(clientId: number, newState: boolean, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const updateUrl = `${this.baseUrl}/estado/${clientId}`;
    const body = { estado: newState };
      return this.http.put(updateUrl, body, { headers });
  }

  public createClient(client: any, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
   return this.http.post(this.baseUrl, client, { headers });
 }

 getClientesActivos(token?:string) {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const urlActivos=`${this.baseUrl}-activos`;
  return this.http.get(urlActivos, { headers });
}

getClientesInactivos(token?:string) {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const urlActivos=`${this.baseUrl}-inactivos`;
  return this.http.get(urlActivos, { headers });
}

public verificarCorreoExistente(correo: string, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const urlVerificarCorreo = `${this.baseUrl}-correo?correo=${correo}`;
  return this.http.get<any>(urlVerificarCorreo, { headers });
}

public verificarTelefonoExistente(telefono: string, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const urlVerificarTelefono = `${this.baseUrl}-telefono?telefono=${telefono}`;
  return this.http.get<any>(urlVerificarTelefono, { headers });
}


public updateCliente(id: number, client: any, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const updateUrl = `${this.baseUrl}/${id}`;
  return this.http.put(updateUrl, client, { headers });
}

public getClientById(clientId: number, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const getClientUrl = `${this.baseUrl}/${clientId}`;
  return this.http.get<any>(getClientUrl, { headers });
}

}
