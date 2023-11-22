import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-editar-categorias-modal',
  templateUrl: './editar-categorias-modal.component.html',
  styleUrls: ['./editar-categorias-modal.component.scss']
})
export class EditarCategoriasModalComponent {

  categoryId: number;
  categoria: any;
  datosOriginales:any;
  idcategoria: number;


datosModificados:any ={
    nombre:'',
    descripcion:'',
}

errorMessages = {
    nombre: '',
    descripcion: '',
  };
  
loading:boolean = false;
modalRef: BsModalRef;
camposValidos:boolean = false;

  constructor(private route: ActivatedRoute,
    private apicategoria : ApiCategoriaService,
    private toastr: ToastrService,
    private router : Router,
    public bsModalRef: BsModalRef
    ) 
    {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id']; // El "+" convierte el valor en un número
    });
  }

  camposCompletos(): boolean {
    return (
      !!this.datosModificados.nombre &&
      !!this.datosModificados.descripcion 
    );
  }

  cambios(): boolean {
    if (!this.datosOriginales) {
        return false;
    }
    return (
        this.datosModificados.nombre !== this.datosOriginales.nombre ||
        this.datosModificados.descripcion !== this.datosOriginales.descripcion
    );
}

  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;


    if (!this.datosModificados.nombre) {
      this.errorMessages.nombre = '';
      this.camposValidos=false;
    } else if (!validacion.test(this.datosModificados.nombre)) {
      this.errorMessages.nombre = 'El nombre solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
      this.camposValidos=false;
    } else if (this.datosModificados.nombre.length > 50) {
      this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
      this.camposValidos=false;
    }else {
      
      const token = localStorage.getItem('token');
      if(this.datosModificados.nombre !== this.datosOriginales.nombre){
      this.apicategoria.verificarNombreExistente(this.datosModificados.nombre ,token).subscribe(
        (response) => {
          if (response.existe) {
            this.errorMessages.nombre = 'Este nombre ya está en uso por otra categoria.';
            this.camposValidos=false;
          } else {
            this.datosModificados.nombre = this.datosModificados.nombre.charAt(0).toUpperCase() + this.datosModificados.nombre.slice(1);
            this.errorMessages.nombre = '';
            this.camposValidos=true;
          }
        },
        (error) => {
          console.error('Error al verificar el correo:', error);
        }
      );
      }
    }
  }

  validarDescripcion(){

    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s]+$/;

    if(!this.datosModificados.descripcion){
      this.errorMessages.descripcion='';
      this.camposValidos=false;
    }else if(!validacion.test(this.datosModificados.descripcion)){
      this.errorMessages.descripcion='La descripcion solo acepta letras, espacios, números y letras con acentos (á, é, í, ó, ú).'
      this.camposValidos=false;
    }else if(this.datosModificados.descripcion.length > 200){
      this.errorMessages.descripcion='La descripcion no puede exceder los 200 caracteres.'
      this.camposValidos=false;
    } else if (this.datosModificados.descripcion.length < 10) {
      this.errorMessages.descripcion = 'La descripcion debe tener 10 o más caracteres.'
      this.camposValidos = false;
    }else{
      this.datosModificados.descripcion = this.datosModificados.descripcion.charAt(0).toUpperCase() + this.datosModificados.descripcion.slice(1);
      this.errorMessages.descripcion='';
      this.camposValidos=true;
    }
  }


  ngOnInit() {
     const token = localStorage.getItem('token');
    this.apicategoria.getCategoryById(this.categoryId, token).subscribe((data) => {
        if (data) {

          this.datosOriginales={
            nombre:data.nombre,
            descripcion:data.descripcion
          };
          
          this.datosModificados.nombre = data.nombre ;
          this.datosModificados.descripcion = data.descripcion;
      
          // Realiza cualquier otra lógica que necesites con los datos del usuario
        } else {
          // Manejar el caso en que no se encontraron datos del usuario
          console.error('No se encontraron datos de la categoria con el ID proporcionado.');
        }
      });
  }

  actualizarCategoria() {
    // Crea un objeto con los campos que deseas actualizar
    const usuarioActualizado = {
      id: this.categoryId,
      nombre: this.datosModificados.nombre,
      descripcion: this.datosModificados.descripcion,
    };
    const token = localStorage.getItem('token');
    this.apicategoria.updateCategory(this.categoryId, usuarioActualizado, token).subscribe((respuesta) => {
      // Manejar la respuesta del servidor, por ejemplo, mostrar un mensaje de éxito o error
      console.log('Respuesta del servidor:', respuesta);
      this.submit();
    });
    console.log(usuarioActualizado);
  }

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/categorias']);
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
    this.toastr.success('Categoria registrada con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
    this.reloadComponent();
    this.cerrarModal();


  }
}
}
