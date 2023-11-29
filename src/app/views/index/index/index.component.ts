import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { tap, switchMap } from 'rxjs/operators';
import { User } from 'src/app/demo/interfaces';
import { AuthService } from 'src/app/demo/service/auth.service';
import { ApiProductosService } from 'src/app/demo/service/productos.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  constructor(
    private http: HttpClient,
    private apiProductos: ApiProductosService
  ) {}

  private authService = inject(AuthService);
  productos: any[] = [];
  resultadoPrediccion: any[] = [];

  get user(): User | null {
    let currentUser: User | null;

    this.authService.currentUser
      .pipe(
        tap(user => {
          currentUser = user;
        })
      )
      .subscribe();

    return currentUser;
  }

  ngOnInit(): void {
    // Obtener la lista de productos y luego realizar la predicción
    this.obtenerProductos()
      .pipe(
        switchMap(productos => this.realizarPrediccion(productos))
      )
      .subscribe(
        (resultado: any) => {
          // console.log('Resultado de la predicción:', resultado);

          // Ahora puedes acceder directamente a las predicciones
          this.resultadoPrediccion = resultado.predicciones;
          
          // console.log("Estas son", this.resultadoPrediccion);
      
          // Puedes realizar más acciones aquí con la respuesta si es necesario
        },
        error => {
          console.error('Error en la solicitud:', error);
          // Puedes manejar el error de acuerdo a tus necesidades
        }
      );
}

  

  obtenerProductos() {
    const token = localStorage.getItem('token');
    return this.apiProductos.getProductos(token).pipe(
      tap(data => {
        this.productos = data;
        // console.log('Productos:', this.productos); // Imprime los productos en la consola
      }),
    );
  }

  realizarPrediccion(productos: any[]) {
    // Cambiar la URL a la ubicación de tu servidor de backend
    const url = 'http://localhost:8080/api/realizar-prediccion';

    // Puedes ajustar el cuerpo de la solicitud según tus necesidades
    const body = {
      productos: productos,
      // Otros campos necesarios para tu predicción
    };

    // Realizar la solicitud POST al servicio de predicción
    return this.http.post<any>(url, body);
  }

  // Obtener el nombre del primer producto si hay predicciones
  get primerNombreProducto(): string | null {
    return this.resultadoPrediccion.length > 0 ? this.resultadoPrediccion[0].nombre_producto : null;
  }
}
