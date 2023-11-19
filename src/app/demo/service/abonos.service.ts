import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiAbonosService {

  constructor(private http: HttpClient) { }

  private baseUrl='http://localhost:8080/api/abonos'

  Local 

  public getAbonos(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.get<any>(this.baseUrl, { headers });
  }

  public getPaymentById(abonoId: number,token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const gePaymentUrl = `${this.baseUrl}/${abonoId}`;
    return this.http.get<any>(gePaymentUrl, { headers });
  }

  public createPayment(abono: any,token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
   return this.http.post(this.baseUrl, abono, { headers });
 }

//Render 

// private baseUrl='https://api-postgress.onrender.com/api/abonos'


//   public getAbonos(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     return this.http.get<any>(this.baseUrl, { headers });
//   }

//   public getPaymentById(abonoId: number,token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const gePaymentUrl = `${this.baseUrl}/${abonoId}`;
//     return this.http.get<any>(gePaymentUrl, { headers });
//   }

//   public createPayment(abono: any,token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//    return this.http.post(this.baseUrl, abono, { headers });
//  }
}
