import { Component } from '@angular/core';
import { ApiServiciosService } from 'src/app/demo/service/servicios.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-crear-servicios-modal',
  templateUrl: './crear-servicios-modal.component.html',
  styleUrls: ['./crear-servicios-modal.component.scss']
})
export class CrearServiciosModalComponent {

  service:any={
    nombre:'',
    descripcion:''
  }

  errorMessages = {
    nombre:'',
    descripcion:''
  }

  loading:boolean =false;
  camposValidos:boolean=false;
  token=localStorage.getItem('token');

  constructor(
    private apiServicios: ApiServiciosService,
    private router: Router,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef
  ){
  }

  camposCompletos():boolean{
    return(
      !!this.service.nombre &&
      !!this.service.descripcion
    )
  }

  validarNombre(){
    const validacion=/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;

    if(!this.service.nombre){
      this.errorMessages.nombre='';
      this.camposValidos=false;
    }else if (!validacion.test(this.service.nombre)){
      this.errorMessages.nombre='El nombre solo acepta letras, espacios y letras con acentos  (á, é, í, ó, ú).';
      this.camposValidos=false;
    }else if(this.service.nombre.length > 50){
      this.errorMessages.nombre='El nombre no debe superar los 50 caracteres.';
      this.camposValidos=false;
    }else{
      this.apiServicios.verificarNombreExistente(this.service.nombre, this.token).subscribe(
        (response) =>{
          if(response.existe){
            this.errorMessages.nombre='El nombre ya esta en uso por otro servicio.';
            this.camposValidos=false;
          }else{
            this.service.nombre = this.service.nombre.charAt(0).toUpperCase() + this.service.nombre.slice(1);
            this.errorMessages.nombre='';
            this.camposValidos=true;
          }
        },
        (error) =>{
          console.error('Error al verificar el nombre:', error)
        }
      )
    }
  }

  validarDescripcion() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s]+$/;
  
    if (!this.service.descripcion) {
      this.errorMessages.descripcion = 'La descripción es obligatoria.';
      this.camposValidos = false;
    } else if (!validacion.test(this.service.descripcion)) {
      this.errorMessages.descripcion = 'La descripcion solo acepta letras, espacios, números y letras con acentos (á, é, í, ó, ú).'
      this.camposValidos = false;
    } else if (this.service.descripcion.length > 200) {
      this.errorMessages.descripcion = 'La descripción no debe superar los 200 caracteres.';
      this.camposValidos = false;
    } else if (this.service.descripcion.length < 10) {
      this.errorMessages.descripcion = 'La descripcion debe tener 10 o más caracteres.'
      this.camposValidos = false;
    } else {
      this.service.descripcion = this.service.descripcion.charAt(0).toUpperCase() + this.service.descripcion.slice(1);
      this.errorMessages.descripcion = '';
      this.camposValidos=true
    }
  }

  registrarServicio(){
    console.log('Haciendo clic en el boton de registrar');

    this.apiServicios.createService(this.service, this.token).subscribe(
      (response) => {
        if(response && response.status === 'success') {
          console.log('Registro exitoso');
          this.submit();
          if(response.service){
            console.log('Datos de el servicio:', response.service)
          }
        }else{
          console.error('Error al registrar el servicio', response.message)
        }
      },
      (error) =>{
        console.error('Error en la solicitud', error)
      }
    )
  }

  cerrarModal(){
    this.bsModalRef.onHidden.subscribe(() =>{
      this.router.navigate(['/servicios'])
    });
    this.bsModalRef.hide();
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
      this.toastr.success('Servicio registrado con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
      this.cerrarModal();
      this.reloadComponent();

    }
  }

}
