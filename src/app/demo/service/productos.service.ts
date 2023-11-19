import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiProductosService {

  constructor(private http: HttpClient ) { }

  baseUrl = 'http://localhost:8080/api/productos'

  // local

  public getProductos(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.get<any>(this.baseUrl, { headers });
  }

  public updateProductState(productId: number, newState: boolean, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const updateUrl = `${this.baseUrl}/estado/${productId}`;
    const body = { estado: newState };
    return this.http.put(updateUrl, body, { headers });
  }

  getProductosActivos(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const activosUrl = `${this.baseUrl}-activos`;
    return this.http.get(activosUrl, { headers });
  }

  getProductosInactivos(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const inactivosUrl = `${this.baseUrl}-inactivos`;
    return this.http.get(inactivosUrl, { headers });
  }

  public createProduct(product: any, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.post<any>(this.baseUrl,product, { headers });
  }

  public verificarNombreExistente(nombre: string, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const urlVerificarNombre = `${this.baseUrl}-nombre?nombre=${nombre}`;
    return this.http.get<any>(urlVerificarNombre, { headers });
  }

  
  public getProductId(productId: number, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const obtenerIdUrl = `${this.baseUrl}/${productId}`;
    return this.http.get<any>(obtenerIdUrl, { headers } );
  }

  public updateProduct(id: number, product: any, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const updateUrl = `${this.baseUrl}/${id}`;
    return this.http.put(updateUrl, product, { headers });
  }

  public agregarCantidad(productId: number, cantidadAAgregar: number, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const agregarCantidadUrl = `${this.baseUrl}-agregar/${productId}`;
    const body = { cantidadSumar: cantidadAAgregar }; // Envía la cantidad a sumar en el cuerpo de la solicitud
    return this.http.put(agregarCantidadUrl, body, { headers });
  }

  public getCantidadActual(id: number, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const cantidadActualUrl = `${this.baseUrl}-cantidad/${id}`;
    return this.http.get<any>(cantidadActualUrl, { headers });
  }

  public getProducByCategoria(categoryId: number, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const getProductUrl = `${this.baseUrl}-categoria/${categoryId}`;
    return this.http.get<any>(getProductUrl, { headers });
  }

  // //Render

  // baseUrl = 'https://api-postgress.onrender.com/api/productos'

  // public getProductos(token?:string) : Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   return this.http.get<any>(this.baseUrl, { headers });
  // }

  // public updateProductState(productId: number, newState: boolean, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const updateUrl = `${this.baseUrl}/estado/${productId}`;
  //   const body = { estado: newState };
  //   return this.http.put(updateUrl, body, { headers });
  // }

  // getProductosActivos(token?:string) : Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const activosUrl = `${this.baseUrl}-activos`;
  //   return this.http.get(activosUrl, { headers });
  // }

  // getProductosInactivos(token?:string) : Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const inactivosUrl = `${this.baseUrl}-inactivos`;
  //   return this.http.get(inactivosUrl, { headers });
  // }

  // public createProduct(product: any, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   return this.http.post<any>(this.baseUrl,product, { headers });
  // }

  // public verificarNombreExistente(nombre: string, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const urlVerificarNombre = `${this.baseUrl}-nombre?nombre=${nombre}`;
  //   return this.http.get<any>(urlVerificarNombre, { headers });
  // }

  
  // public getProductId(productId: number, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const obtenerIdUrl = `${this.baseUrl}/${productId}`;
  //   return this.http.get<any>(obtenerIdUrl, { headers } );
  // }

  // public updateProduct(id: number, product: any, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const updateUrl = `${this.baseUrl}/${id}`;
  //   return this.http.put(updateUrl, product, { headers });
  // }

  // public agregarCantidad(productId: number, cantidadAAgregar: number, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const agregarCantidadUrl = `${this.baseUrl}-agregar/${productId}`;
  //   const body = { cantidadSumar: cantidadAAgregar }; // Envía la cantidad a sumar en el cuerpo de la solicitud
  //   return this.http.put(agregarCantidadUrl, body, { headers });
  // }

  // public getCantidadActual(id: number, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const cantidadActualUrl = `${this.baseUrl}-cantidad/${id}`;
  //   return this.http.get<any>(cantidadActualUrl, { headers });
  // }

  // public getProducByCategoria(categoryId: number, token?:string): Observable<any> {
  //   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  //   const getProductUrl = `${this.baseUrl}-categoria/${categoryId}`;
  //   return this.http.get<any>(getProductUrl, { headers });
  // }

}
