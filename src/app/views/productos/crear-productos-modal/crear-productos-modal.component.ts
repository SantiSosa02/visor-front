import { Component } from '@angular/core';
import { ApiProductosService } from 'src/app/demo/service/productos.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';

@Component({
  selector: 'app-crear-productos-modal',
  templateUrl: './crear-productos-modal.component.html',
  styleUrls: ['./crear-productos-modal.component.scss']
})
export class CrearProductosModalComponent {

  product: any = {
    nombre: '',
    categoria: '',
    stock_minimo:'',
    cantidad:'',
    precio_venta:'',
  };

  errorMessages = {
    nombre: '',
    stock_minimo:'',
    cantidad:'',
    precio_venta:'',
  };
  
loading:boolean = false;

  constructor(
    public apiProducto: ApiProductosService, 
    private router: Router,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef,
    private apiCategorias: ApiCategoriaService
    ) {}

  
  categorias: any[] = [];
  camposValidos:boolean = false;

  ngOnInit(): void {
    this.obtenerCategorias();
  }
  
  obtenerCategorias() {
    const token = localStorage.getItem('token')
    this.apiCategorias.getCategorias(token).subscribe(
      (data) => {
        // Filtra las categorías con estado activo
        this.categorias = data.filter(categoria => categoria.estado === true);
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }
  
  camposCompletos(): boolean {
    return (
      !!this.product.nombre &&
      !!this.product.idcategoria &&
      !!this.product.stock_minimo &&
      !!this.product.cantidad &&
      !!this.product.precio_venta 
    );
  }



  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s]+$/;

    if (!this.product.nombre) {
      this.errorMessages.nombre = '';
      this.camposValidos=false;
    } else if (!validacion.test(this.product.nombre)) {
      this.errorMessages.nombre = 'El nombre solo acepta letras, espacios, números y letras con acentos (á, é, í, ó, ú).';
      this.camposValidos=false;
    } else if (this.product.nombre.length > 50) {
      this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
      this.camposValidos=false;
    }else {

      const token =localStorage.getItem('token');
      this.apiProducto.verificarNombreExistente(this.product.nombre,token).subscribe(
        (response) => {
          if (response.existe) {
            this.errorMessages.nombre = 'Este nombre ya está en uso por otro producto.';
            this.camposValidos=false;
          } else {
            this.product.nombre = this.product.nombre.charAt(0).toUpperCase() + this.product.nombre.slice(1);
            this.errorMessages.nombre = '';
            this.camposValidos=true;
          }
        },
        (error) => {
          console.error('Error al verificar el nombre:', error);
        }
      );
    }
  }

  validarStockMinimo(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');
    console.log(typeof inputValue);
    // Aplica la validación de números mayores a 0
    const validacion = /^[1-9][0-9]*$/;
    if (inputValue && !validacion.test(inputValue) || +inputValue > 50) {
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
    this.product.stock_minimo = inputValue;
}

validarCantidad(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  let inputValue = inputElement.value;

  // Elimina la letra "e" si está presente
  inputValue = inputValue.replace(/e/gi, '');
  console.log(typeof inputValue);
  // Aplica la validación de números mayores a 0
  const validacion = /^[1-9][0-9]*$/;
  if (inputValue && !validacion.test(inputValue) || +inputValue > 100) {
      // Si no pasa la validación, puedes mostrar un mensaje de error
      this.errorMessages.cantidad = 'La cantidad solo acepta números mayores a 0 y menor o igual a 100. ';
  } else {
      // Si pasa la validación, elimina el mensaje de error
      this.errorMessages.cantidad = '';
  }

  // Asigna el valor limpio nuevamente al campo de entrada
  inputElement.value = inputValue;

  // También actualiza la propiedad vinculada al modelo de datos
  this.product.cantidad = inputValue;
}

validarPrecioVenta(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  let inputValue = inputElement.value;

  // Elimina la letra "e" si está presente
  inputValue = inputValue.replace(/e/gi, '');
  console.log(typeof inputValue);
  // Verifica si el campo está vacío y elimina el mensaje de error
  if (inputValue.trim() === '') {
    this.errorMessages.precio_venta = '';
    this.camposValidos=false;
  } else {
    // Convierte el valor a un número
    const numericValue = parseInt(inputValue.replace(/[^\d.-]/g, ''), 10);

    if (!isNaN(numericValue) && numericValue >= 1000 && numericValue <= 10000000) {
      // Si el valor es numérico y cumple con los límites, no muestra ningún formato
      this.errorMessages.precio_venta = '';
      this.camposValidos=true;
    } else {
      this.errorMessages.precio_venta = 'El precio de venta debe ser un número válido en pesos colombianos (mayor o igual a 1.000 y menor que 10.000.000).';
      this.camposValidos=false;
    }
  }

  // Asigna el valor limpio nuevamente al campo de entrada
  inputElement.value = inputValue;

  // También actualiza la propiedad vinculada al modelo de datos
  this.product.precio_venta = inputValue;
}


  registrarProducto() {
    console.log('Haciendo clic en el botón de Registrar');
    const token=localStorage.getItem('token');
    this.apiProducto.createProduct(this.product,token).subscribe(
      (response) => {
        console.log('Respuesta del servidor:', response);
        if (response && response.status === 'success') {
          console.log('Registro exitoso');
          this.submit();
          if (response.producto) {
            console.log('Datos del producto:', response.producto); // Actualiza el mensaje aquí
          }
        } else {
          console.error('Error al registrar el producto:', response.message); // Actualiza el mensaje aquí
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  

cerrarModal() {
  this.bsModalRef.onHidden.subscribe(() => {
    // Esta función se ejecutará después de que el modal se haya ocultado completamente
    this.router.navigate(['/productos']);
  });
  this.bsModalRef.hide();  // Cierra el modal
}
  
  cancelarRegistro() {
    window.history.back();
  }

  mostrarNotificacion(message: string, title: string) {
    this.toastr.success(message, title, {
      positionClass: 'toast-top-right', // Configura la posición en la esquina superior derecha
    });
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }

  submit() {
    if (!this.loading) {
      this.loading = true;
  
      // Cambia el tiempo de duración del mensaje del Toastr a 1000 ms (1 segundo)
      this.toastr.success('Producto registrada con éxito.', 'Éxito', { progressBar: true, timeOut: 1000 });
  
      // Espera 1 segundo antes de cerrar el modal y recargar el componente
      setTimeout(() => {
        this.loading = false;
        this.cerrarModal();
        this.reloadComponent();
      }, 1000);
    }
  }

}
