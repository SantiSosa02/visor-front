import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiCategoriaService {

  

  constructor(private http: HttpClient) {}

//   private baseUrl='http://localhost:8080/api/categorias'

//   local

//   public getCategorias(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     return this.http.get<any>(this.baseUrl, { headers });
//   }

//   public updateCategoryState(categoryId: number, newState: boolean, token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const updateUrl = `${this.baseUrl}/estado/${categoryId}`
//     const body = {estado:newState}
//     return this.http.put(updateUrl, body, { headers });
//   }

//   getActiveCategory(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const urlActives = `${this.baseUrl}-activas`;
//     return this.http.get<any>(urlActives, { headers });
//   }

//   getInactiveCategory(token?:string) : Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//     const urlInactive = `${this.baseUrl}-inactivas`;
//     return this.http.get<any>(urlInactive, { headers });
//   }

  
//   public createCategory(category: any, token?:string): Observable<any> {
//     const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//    return this.http.post(this.baseUrl, category , { headers });
//  }

//  public getCategoryById(categoryId: number, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const categoryUrlId = `${this.baseUrl}/${categoryId}`;
//   return this.http.get<any>(categoryUrlId,{headers});
// }

// public updateCategory(id: number, category: any, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//  const updateUrl = `${this.baseUrl}/${id}`
//   return this.http.put(updateUrl, category, { headers });
// }

// public verificarNombreExistente(nombre: string, token?:string): Observable<any> {
//   const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
//   const verificarNomrebUrl = `${this.baseUrl}-nombre?nombre=${nombre}`
//   return this.http.get<any>(verificarNomrebUrl, { headers });
// }



//Render

private baseUrl='https://api-postgress.onrender.com/api/categorias'


  public getCategorias(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    return this.http.get<any>(this.baseUrl, { headers });
  }

  public updateCategoryState(categoryId: number, newState: boolean, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const updateUrl = `${this.baseUrl}/estado/${categoryId}`
    const body = {estado:newState}
    return this.http.put(updateUrl, body, { headers });
  }

  getActiveCategory(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const urlActives = `${this.baseUrl}-activas`;
    return this.http.get<any>(urlActives, { headers });
  }

  getInactiveCategory(token?:string) : Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
    const urlInactive = `${this.baseUrl}-inactivas`;
    return this.http.get<any>(urlInactive, { headers });
  }

  
  public createCategory(category: any, token?:string): Observable<any> {
    const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
   return this.http.post(this.baseUrl, category , { headers });
 }

 public getCategoryById(categoryId: number, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const categoryUrlId = `${this.baseUrl}/${categoryId}`;
  return this.http.get<any>(categoryUrlId,{headers});
}

public updateCategory(id: number, category: any, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
 const updateUrl = `${this.baseUrl}/${id}`
  return this.http.put(updateUrl, category, { headers });
}

public verificarNombreExistente(nombre: string, token?:string): Observable<any> {
  const headers = token ? new HttpHeaders().set('x-token', token) : undefined;
  const verificarNomrebUrl = `${this.baseUrl}-nombre?nombre=${nombre}`
  return this.http.get<any>(verificarNomrebUrl, { headers });
}


}
