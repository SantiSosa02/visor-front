import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiVentasService {
  
  constructor(private http: HttpClient) {}

//   private baseUrl='http://localhost:8080/api/ventas'

//   //Local 

//   public getVentas(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     return this.http.get<any>(this.baseUrl, { headers });
//   }

//   getVentasActivos(token?:string) {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const urlActivos=`${this.baseUrl}-activas`;
//     return this.http.get(urlActivos, { headers });
//   }

//   getVentasInactivos(token?:string) {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const urlInactivos=`${this.baseUrl}-inactivas`;
//     return this.http.get(urlInactivos, { headers });
//   }

//   public getVentasById(saleId: number,token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const getSaleUrl = `${this.baseUrl}/${saleId}`;
//     return this.http.get<any>(getSaleUrl, { headers });
//   }

//   public createSale(sale: any,token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     return this.http.post(this.baseUrl, sale, { headers });
//  }

// public updateSaleState(saleId: number, newState: boolean,token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const updateUrl = `${this.baseUrl}/estado/${saleId}`;
//   const body = { estado: newState };
//   return this.http.put(updateUrl, body, { headers });
// }

// public getAbonosRelacionados(saleId: number,token?:string): Observable<any[]> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const abonosUrl = `${this.baseUrl}/abonos-relacionados/${saleId}`;
//   return this.http.get<any[]>(abonosUrl, { headers });
// }


// //Render 

private baseUrl='https://api-postgress.onrender.com/api/ventas'

  public getVentas(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.get<any>(this.baseUrl, { headers });
  }

  getVentasActivos(token?:string) {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const urlActivos=`${this.baseUrl}-activas`;
    return this.http.get(urlActivos, { headers });
  }

  getVentasInactivos(token?:string) {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const urlInactivos=`${this.baseUrl}-inactivas`;
    return this.http.get(urlInactivos, { headers });
  }

  public getVentasById(saleId: number,token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const getSaleUrl = `${this.baseUrl}/${saleId}`;
    return this.http.get<any>(getSaleUrl, { headers });
  }

  public createSale(sale: any,token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.post(this.baseUrl, sale, { headers });
 }

public updateSaleState(saleId: number, newState: boolean,token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const updateUrl = `${this.baseUrl}/estado/${saleId}`;
  const body = { estado: newState };
  return this.http.put(updateUrl, body, { headers });
}

public getAbonosRelacionados(saleId: number,token?:string): Observable<any[]> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const abonosUrl = `${this.baseUrl}/abonos-relacionados/${saleId}`;
  return this.http.get<any[]>(abonosUrl, { headers });
}


}
