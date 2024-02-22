import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiciosService } from 'src/app/demo/service/servicios.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-editar-servicios-modal',
  templateUrl: './editar-servicios-modal.component.html',
  styleUrls: ['./editar-servicios-modal.component.scss']
})
export class EditarServiciosModalComponent {


  constructor(
    private apiServicio: ApiServiciosService,
    private toastr: ToastrService,
    private router: Router,
    public bsModalRef: BsModalRef,
    private route: ActivatedRoute
  ){
    this.route.params.subscribe(params =>{
      this.serviceId= +params['id'];
    })
  }
  serviceId:number;
  servicio:any;
  datosOriginales:any;
  idservicio:number;

  datosModificados:any={
    nombre:'',
    descripcion:'',
    estado:false
  }

  errorMessages={
    nombre:'',
    descripcion:''
  }

  loading:boolean=false;
  modalRef: BsModalRef;
  camposValidos:boolean=false;
  token=localStorage.getItem('token')

  camposCompletos():boolean{
    return(
      !!this.datosModificados.nombre &&
      !!this.datosModificados.descripcion
    );
  }

  cambios():boolean{
    if(!this.datosOriginales){
      return false;
    }
    return(
      this.datosModificados.nombre !== this.datosOriginales.nombre ||
      this.datosModificados.descripcion !== this.datosOriginales.descripcion
    )
  }

  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;

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
        } else if (this.datosModificados.nombre.length < 3) {
          this.errorMessages.nombre = 'El nombre no debe ser menor a 3 caracteres.';
          this.camposValidos = false;
      }else {
            if (this.datosModificados.nombre !== this.datosOriginales.nombre) {
                this.apiServicio.verificarNombreExistente(this.datosModificados.nombre, this.token).subscribe(
                    (response) => {
                        if (response.existe) {
                            this.errorMessages.nombre = 'Este nombre ya está en uso por otro servicio.';
                            this.camposValidos = false;
                        } else {
                            // Capitalizar solo la primera letra de la primera palabra
                            this.datosModificados.nombre = this.datosModificados.nombre.charAt(0).toUpperCase() + this.datosModificados.nombre.slice(1).toLowerCase();
                            this.errorMessages.nombre = '';
                            this.camposValidos = true;
                        }
                    },
                    (error) => {
                        console.error('Error al verificar el nombre:', error);
                    }
                );
            } else {
                this.errorMessages.nombre = '';
            }
        }
    }
}

  

  validarDescripcion() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s]+$/;
  
    if (!this.datosModificados.descripcion) {
      this.errorMessages.descripcion = '';
      this.camposValidos = false;
    } else if (!validacion.test(this.datosModificados.descripcion)) {
      this.errorMessages.descripcion = 'La descripcion solo acepta letras, espacios, números y letras con acentos (á, é, í, ó, ú).'
      this.camposValidos = false;
    } else if (this.datosModificados.descripcion.length > 200) {
      this.errorMessages.descripcion = 'La descripción no debe superar los 200 caracteres.';
      this.camposValidos = false;
    } else if (this.datosModificados.descripcion.length < 10) {
      this.errorMessages.descripcion = 'La descripcion debe tener 10 o más caracteres.'
      this.camposValidos = false;
    } else {
      // Transformaciones para la descripción
      this.datosModificados.descripcion = this.datosModificados.descripcion.trim();
      this.datosModificados.descripcion = this.datosModificados.descripcion.replace(/\s+/g, ' ');
      this.datosModificados.descripcion = this.datosModificados.descripcion.charAt(0).toUpperCase() + this.datosModificados.descripcion.slice(1);

      this.errorMessages.descripcion = '';
      this.camposValidos = true;
    }
  }

  ngOnInit(){
    this.apiServicio.getServiceById(this.serviceId, this.token).subscribe(
      (data) =>{
        if(data){
          this.datosOriginales={
            nombre:data.nombre,
            descripcion:data.descripcion
          }
          this.datosModificados.nombre=data.nombre;
          this.datosModificados.descripcion=data.descripcion;
          this.datosModificados.estado= data.estado;
        }else{
          console.error('No se encontro el servicio con el ID proporcionado.')
        }
      }
    )
  }

  actualizarServicio(){
    const servicioActualizado={
      id:this.serviceId,
      nombre:this.datosModificados.nombre,
      descripcion:this.datosModificados.descripcion
    };
    this.apiServicio.updateService(this.serviceId, servicioActualizado, this.token).subscribe(
      (respuesta) =>{
        this.submit();
      }
    );
  }

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/servicios']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }

  submit(){
    if(!this.loading){
      this.loading=true;
      this.toastr.success('Servicio actualizado con exito', 'Exito', { progressBar:true, timeOut:2000});
      this.cerrarModal();
      this.reloadComponent();

    }
  }

}
