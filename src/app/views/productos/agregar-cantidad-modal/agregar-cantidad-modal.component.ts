import { Component, Input } from '@angular/core';
import { ApiProductosService } from 'src/app/demo/service/productos.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';



@Component({
  selector: 'app-agregar-cantidad-modal',
  templateUrl: './agregar-cantidad-modal.component.html',
  styleUrls: ['./agregar-cantidad-modal.component.scss']
})
export class AgregarCantidadModalComponent {
 
  @Input() productId: number;
  cantidadAAgregar: number;
  cantidadActual: number;
  cantidadTotal:number;

  constructor(
    private route: ActivatedRoute,
    private apiProducto: ApiProductosService,
    private toastr: ToastrService,
    private bsModalRef: BsModalRef,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      this.productId = +params['id']; // El "+" convierte el valor en un número
    });
  }

  errorMessages = {
    cantidad: ''
  };
  

  loading:boolean = false;
  camposValidos:boolean=false;
  token=localStorage.getItem('token');


  camposCompletos(): boolean {
    return (
      !!this.cantidadAAgregar
    );
  }


  validarCantidad(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
  
    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');
  
    // Aplica la validación de números y que no comience con 0
    const validacion = /^[1-9][0-9]*$/;
  
    if (inputValue === '') {
      // Si el campo está vacío, elimina el mensaje de error
      this.errorMessages.cantidad = '';
      this.camposValidos=false;
    } else if (!validacion.test(inputValue) || +inputValue > 100 ) {
      // Si no pasa la validación, muestra un mensaje de error
      this.errorMessages.cantidad = 'La cantidad debe ser un número mayor a 0 y menor o igual a 100.';
      this.camposValidos=false;
    } else {
      // Si pasa la validación, elimina el mensaje de error y actualiza la cantidad total
      this.errorMessages.cantidad = '';
      this.camposValidos=true;
      this.actualizarCantidadTotal();
    }
  }
  
  
  ngOnInit() {
  
    this.apiProducto.getCantidadActual(this.productId, this.token).subscribe((cantidad) => {
      if (cantidad !== undefined) {
        this.cantidadActual = cantidad;
        this.actualizarCantidadTotal();
        console.log(this.cantidadActual);
      } else {
        console.error('No se encontró la cantidad del producto con el ID proporcionado.');
      }
    });
  }

  actualizarCantidadTotal(){
    this.cantidadTotal = this.cantidadActual + (this.cantidadAAgregar || 0); // Usar 0 si cantidadAAgregar es undefined
  }

  agregarCantidad() {
    if (this.cantidadAAgregar > 0) {
      this.apiProducto.agregarCantidad(this.productId, this.cantidadAAgregar,this.token).subscribe(
        (response) => {
          // Actualizar la cantidad actual con la cantidad agregada
          this.cantidadActual += this.cantidadAAgregar;
          this.actualizarCantidadTotal();
          this.submit();
        },
        (error) => {
          // Manejar errores en la solicitud, si es necesario
          console.error('Error al agregar cantidad:', error);
        }
      );
    } else {
      // La cantidad a agregar no es válida, muestra un mensaje de error
      this.toastr.error('La cantidad a agregar debe ser un número positivo mayor o igual a 1');
    }
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

  submit() {
    if (!this.loading) {
      this.loading = true;
  
      // Cambia el tiempo de duración del mensaje del Toastr a 1000 ms (1 segundo)
      this.toastr.success('Cantidad agregada con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
      this.cerrarModal();
      this.reloadComponent();

    }
  }

}
