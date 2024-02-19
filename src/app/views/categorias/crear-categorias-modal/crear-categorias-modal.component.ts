import { Component } from '@angular/core';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';



@Component({
  selector: 'app-crear-categorias-modal',
  templateUrl: './crear-categorias-modal.component.html',
  styleUrls: ['./crear-categorias-modal.component.scss']
})
export class CrearCategoriasModalComponent {

  category: any = {
    nombre: '',
    descripcion: '',
  };


  errorMessages = {
    nombre: '',
    descripcion: '',
  };
  
loading:boolean = false;
camposValidos:boolean = false;

  constructor(
    private apicategoria: ApiCategoriaService, 
    private router: Router,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef
    ) {}

  camposCompletos(): boolean {
    return (
      !!this.category.nombre &&
      !!this.category.descripcion 
    );
  }

  // validarNombre() {
  //   const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  
  //   if (!this.category.nombre) {
  //     this.errorMessages.nombre = '';
  //   } else if (!validacion.test(this.category.nombre)) {
  //     this.errorMessages.nombre = 'El nombre solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
  //   } else if (this.category.nombre.length > 50) {
  //     this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
  //   } else {
  //     this.errorMessages.nombre = '';
  //   }
  // }

  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  
    if (!this.category.nombre) {
        this.errorMessages.nombre = '';
        this.camposValidos = false;
    } else {
        // Eliminar espacios en blanco al inicio y al final del nombre
        this.category.nombre = this.category.nombre.trim();
  
        this.category.nombre = this.category.nombre.replace(/\s+/g, ' ');

        if (!validacion.test(this.category.nombre)) {
            this.errorMessages.nombre = 'El nombre solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
            this.camposValidos = false;
        } else if (this.category.nombre.length > 50) {
            this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
            this.camposValidos = false;
        } else if (this.category.nombre.length < 3) {
          this.errorMessages.nombre = 'El nombre no debe ser menor a 3 caracteres.';
          this.camposValidos = false;
      }else {
            const token = localStorage.getItem('token');
            this.apicategoria.verificarNombreExistente(this.category.nombre, token).subscribe(
                (response) => {
                    if (response.existe) {
                        this.errorMessages.nombre = 'Este nombre ya está en uso por otra categoría.';
                        this.camposValidos = false;
                    } else {
                        // Capitalizar solo la primera letra de la primera palabra
                        this.category.nombre = this.category.nombre.charAt(0).toUpperCase() + this.category.nombre.slice(1).toLowerCase();
                        this.errorMessages.nombre = '';
                        this.camposValidos = true;
                    }
                },
                (error) => {
                    console.error('Error al verificar el nombre:', error);
                }
            );
        }
    }
}



  validarDescripcion() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s]+$/;

    if (!this.category.descripcion) {
        this.errorMessages.descripcion = '';
        this.camposValidos = false;
    } else if (!validacion.test(this.category.descripcion)) {
        this.errorMessages.descripcion = 'La descripción solo acepta letras, espacios, números y letras con acentos (á, é, í, ó, ú).'
        this.camposValidos = false;
    } else if (this.category.descripcion.length > 200) {
        this.errorMessages.descripcion = 'La descripción no debe superar los 200 caracteres.';
        this.camposValidos = false;
    } else if (this.category.descripcion.length < 10) {
        this.errorMessages.descripcion = 'La descripcion debe tener 10 o más caracteres.'
        this.camposValidos = false;
    } else {
        // Transformaciones para la descripción
        this.category.descripcion = this.category.descripcion.trim();
        this.category.descripcion = this.category.descripcion.replace(/\s+/g, ' ');
        this.category.descripcion = this.category.descripcion.charAt(0).toUpperCase() + this.category.descripcion.slice(1);

        this.errorMessages.descripcion = '';
        this.camposValidos = true;
    }
}



  registrarCategoria() {
    const token = localStorage.getItem('token'); 
    this.apicategoria.createCategory(this.category, token).subscribe(
      (response) => {
        console.log('Respuesta del servidor:', response);
        if (response && response.status === 'success') {
          console.log('Registro exitoso');
          this.submit();
          if (response.categoria) {
            console.log('Datos de la categoría:', response.usuario);
          }
        } else {
          console.error('Error al registrar la categoría:', response.message);
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
    this.router.navigate(['/categorias']);
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
      this.toastr.success('Categoria registrada con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
      this.cerrarModal();
      this.reloadComponent();

    }
  }
}
