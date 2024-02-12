import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiProductosService } from 'src/app/demo/service/productos.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';
@Component({
  selector: 'app-editar-productos-modal',
  templateUrl: './editar-productos-modal.component.html',
  styleUrls: ['./editar-productos-modal.component.scss']
})
export class EditarProductosModalComponent {

  productId: number;
  producto: any; // Aquí deberías definir la estructura de datos para el usuario
  datosOriginales:any;
  idproducto: number;


datosModificados:any ={
  nombre: '',
  idcategoria: '',
  stock_minimo:'',
  cantidad:'',
  precio_venta:'',
}

errorMessages = {
  nombre: '',
  stock_minimo:'',
  cantidad:'',
  precio_venta:'',
};
  
loading:boolean = false;
modalRef: BsModalRef;
categorias: any[] = [];
categoriaCambiada = false;
camposValidos:boolean = false;
token=localStorage.getItem('token');


  constructor(private route: ActivatedRoute,
    private apiProducto : ApiProductosService,
    private toastr: ToastrService,
    private router : Router,
    public bsModalRef: BsModalRef, 
    private apíCategorias: ApiCategoriaService
    ) 
    {
    this.route.params.subscribe(params => {
      this.productId = +params['id']; // El "+" convierte el valor en un número
    });
  }
  
  camposCompletos(): boolean {
    return (
      !!this.datosModificados.nombre &&
      !!this.datosModificados.idcategoria &&
      !!this.datosModificados.stock_minimo &&
      !!this.datosModificados.cantidad &&
      !!this.datosModificados.precio_venta 
    );
  }

  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s]+$/;
  
    if (!this.datosModificados.nombre) {
      this.errorMessages.nombre = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del nombre
      this.datosModificados.nombre = this.datosModificados.nombre.trim();

      this.datosModificados.nombre = this.datosModificados.nombre.replace(/\s+/g, ' ');
  
      if (!validacion.test(this.datosModificados.nombre)) {
        this.errorMessages.nombre = 'El nombre solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.datosModificados.nombre.length > 50) {
        this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
        this.camposValidos = false;
      } else {
        if (this.datosModificados.nombre !== this.datosOriginales.nombre) {
          this.apiProducto.verificarNombreExistente(this.datosModificados.nombre, this.token).subscribe(
            (response) => {
              if (response.existe) {
                this.errorMessages.nombre = 'Este nombre ya está en uso por otro usuario.';
                this.camposValidos = false;
              } else {
                this.datosModificados.nombre = this.datosModificados.nombre.charAt(0).toUpperCase() + this.datosModificados.nombre.slice(1);
                this.errorMessages.nombre = '';
                this.camposValidos = true;
              }
            },
            (error) => {
              console.error('Error al verificar el nombre:', error);
            }
          );
        } else {
          // Si el nombre es el mismo que el original, no mostramos el mensaje de error
          this.errorMessages.nombre = '';
        }
      }
    }
  }
  
  

  validarStockMinimo(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');

    // Aplica la validación de números mayores a 0
    const validacion = /^[1-9][0-9]*$/;
    if (inputValue && !validacion.test(inputValue)  || +inputValue > 50) {
        // Si no pasa la validación, puedes mostrar un mensaje de error
        this.errorMessages.stock_minimo = 'El stock mínimo solo acepta números mayores a 1 y menor o igual a 50.';
        this.camposValidos=false;
    } else {
        // Si pasa la validación, elimina el mensaje de error
        this.errorMessages.stock_minimo = '';
        this.camposValidos=true;
    }

    // Asigna el valor limpio nuevamente al campo de entrada
    inputElement.value = inputValue;

    // También actualiza la propiedad vinculada al modelo de datos
    this.datosModificados.stock_minimo = inputValue;
}

validarCantidad(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  let inputValue = inputElement.value;

  // Elimina la letra "e" si está presente
  inputValue = inputValue.replace(/e/gi, '');

  // Aplica la validación de números mayores a 0
  const validacion = /^[1-9][0-9]*$/;
  if (inputValue && !validacion.test(inputValue) || +inputValue > 100) {
      // Si no pasa la validación, puedes mostrar un mensaje de error
      this.errorMessages.cantidad = 'La cantidad solo acepta números mayores a 0 y menor o igual a 100.';
      this.camposValidos=false;
  } else {
      // Si pasa la validación, elimina el mensaje de error
      this.errorMessages.cantidad = '';
      this.camposValidos=true;
  }

  // Asigna el valor limpio nuevamente al campo de entrada
  inputElement.value = inputValue;

  // También actualiza la propiedad vinculada al modelo de datos
  this.datosModificados.cantidad = inputValue;
}

validarPrecioVenta(event: Event) {
  console.log('Validando precio...');

  const inputElement = event.target as HTMLInputElement;
  let inputValue = inputElement.value;

  // Elimina la letra "e" si está presente
  inputValue = inputValue.replace(/e/gi, '');

  // Remueve los separadores de miles (puntos)
  inputValue = inputValue.replace(/\./g, '');

  // Verifica si el campo está vacío
  if (!inputValue.trim()) {
      // Si el campo está vacío, no muestra ningún mensaje de error
      this.errorMessages.precio_venta = '';
      this.camposValidos = true;
      return; // Sale de la función
  }

  // Convierte el valor a un número
  const numericValue = parseFloat(inputValue);

  // Verifica si el valor está dentro de los límites
  if (numericValue >= 1000 && numericValue <= 10000000) {
      // Si el valor está dentro de los límites, no muestra ningún mensaje de error
      this.errorMessages.precio_venta = '';
      this.camposValidos = true;
  } else {
      // Si el valor está fuera de los límites, muestra un mensaje de error
      this.errorMessages.precio_venta = 'El precio de venta debe estar entre 1.000 y 10.000.000.';
      this.camposValidos = false;
  }
}

validarCategoria() {
  this.categoriaCambiada = this.datosModificados.idcategoria !== this.datosOriginales.idcategoria;
  console.log('Categoría cambiada:', this.categoriaCambiada);
  this.camposValidos=true;
}


cambios(): boolean {
  if (!this.datosOriginales) {
    return false;
  }

  const nombreCambiado = this.datosModificados.nombre !== this.datosOriginales.nombre;
  const stockMinimoCambiado = this.datosModificados.stock_minimo !== this.datosOriginales.stock_minimo;
  const cantidadCambiado = this.datosModificados.cantidad !== this.datosOriginales.cantidad;
  const precioVentaCambiado = this.datosModificados.precio_venta !== this.datosOriginales.precio_venta;

  return nombreCambiado || this.categoriaCambiada || stockMinimoCambiado || cantidadCambiado || precioVentaCambiado;
}


  ngOnInit() {
    
    this.apiProducto.getProductId(this.productId, this.token).subscribe((data) => {
        if (data) {

          this.datosOriginales={
            nombre:data.nombre,
            idcategoria:data.idcategoria,
            stock_minimo:data.stock_minimo,
            cantidad:data.cantidad,
            precio_venta:data.precio_venta
          };
          
          this.datosModificados.nombre = data.nombre ;
          this.datosModificados.idcategoria = data.idcategoria ;
          this.datosModificados.stock_minimo = data.stock_minimo ;
          this.datosModificados.cantidad = data.cantidad ;
          this.datosModificados.precio_venta = data.precio_venta;
          
          this.apíCategorias.getCategorias(this.token).subscribe((categorias) => {
            this.categorias = categorias;
          });
          // Realiza cualquier otra lógica que necesites con los datos del usuario
        } else {
          // Manejar el caso en que no se encontraron datos del usuario
          console.error('No se encontraron datos del usuario con el ID proporcionado.');
        }
      });
  }

  actualizarProducto() {
    // Crea un objeto con los campos que deseas actualizar
    const productoActualizado = {
      id: this.productId,
      nombre: this.datosModificados.nombre,
      idcategoria: this.datosModificados.idcategoria,
      stock_minimo: this.datosModificados.stock_minimo,
      cantidad: this.datosModificados.cantidad,
      precio_venta: this.datosModificados.precio_venta,
    };
  
  
    this.apiProducto.updateProduct(this.productId, productoActualizado, this.token).subscribe((respuesta) => {
      // Manejar la respuesta del servidor, por ejemplo, mostrar un mensaje de éxito o error
      console.log('Respuesta del servidor:', respuesta);
      this.submit();
    });
    console.log(productoActualizado);
  }

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/productos']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }

//   submit() {
//     if (!this.loading) {
//         this.loading = true;
//         setTimeout(() => {
//             this.toastr.success('Usuario actualizado con éxito', 'Éxito', { progressBar: true, timeOut: 1000 });

//                 this.reloadComponent();
//                 this.cerrarModal();

//         }, 1000);
//     }
// }
  
submit() {
  if (!this.loading) {
    this.loading = true;

    // Cambia el tiempo de duración del mensaje del Toastr a 1000 ms (1 segundo)
    this.toastr.success('Producto actualizado con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
    this.cerrarModal();
    this.reloadComponent();
  }
}

}
