import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiServiciosService {

  constructor(private http: HttpClient) { }

//   baseUrl = 'http://localhost:8080/api/servicios'

//   //Local 

//   public getServices(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     return this.http.get<any>(this.baseUrl, { headers });
//   }

//   public updateServiceState(serviceId: number, newState: boolean,token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const updateUrl = `${this.baseUrl}/estado/${serviceId}`;
//     const body = { estado: newState };
//     return this.http.put(updateUrl, body, { headers });
//   }

//   getServiciosActivos(token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const urlActivos=`${this.baseUrl}-activos`
//     return this.http.get(urlActivos , { headers });
//   }

//   getServiciosInactivos(token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const urlActivos=`${this.baseUrl}-inactivos`
//     return this.http.get(urlActivos , { headers });
//   }

//   public createService(category: any, token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//    return this.http.post(this.baseUrl, category, { headers });
//  }

//  public getServiceById(serviceId: number, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const getServiceUrl = `${this.baseUrl}/${serviceId}`;
//   return this.http.get<any>(getServiceUrl, { headers });
// }

// public updateService(id: number, service: any, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const updateUrl = `${this.baseUrl}/${id}`;
//   return this.http.put(updateUrl, service, { headers });
// }

// public verificarNombreExistente(nombre: string, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const urlVerificarNombre = `${this.baseUrl}-nombre?nombre=${nombre}`;
//   return this.http.get<any>(urlVerificarNombre, { headers });
// }


// Render 

baseUrl = 'https://api-postgress.onrender.com/api/servicios'

 public getServices(token?:string) : Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      return this.http.get<any>(this.baseUrl, { headers });
    }
  
    public updateServiceState(serviceId: number, newState: boolean,token?:string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      const updateUrl = `${this.baseUrl}/estado/${serviceId}`;
      const body = { estado: newState };
      return this.http.put(updateUrl, body, { headers });
    }
  
    getServiciosActivos(token?:string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      const urlActivos=`${this.baseUrl}-activos`
      return this.http.get(urlActivos , { headers });
    }
  
    getServiciosInactivos(token?:string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
      const urlActivos=`${this.baseUrl}-inactivos`
      return this.http.get(urlActivos , { headers });
    }
  
    public createService(category: any, token?:string): Observable<any> {
      const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
     return this.http.post(this.baseUrl, category, { headers });
   }
  
   public getServiceById(serviceId: number, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const getServiceUrl = `${this.baseUrl}/${serviceId}`;
    return this.http.get<any>(getServiceUrl, { headers });
  }
  
  public updateService(id: number, service: any, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const updateUrl = `${this.baseUrl}/${id}`;
    return this.http.put(updateUrl, service, { headers });
  }
  
  public verificarNombreExistente(nombre: string, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const urlVerificarNombre = `${this.baseUrl}-nombre?nombre=${nombre}`;
    return this.http.get<any>(urlVerificarNombre, { headers });
  }

}
