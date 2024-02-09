
import { NgForm } from '@angular/forms';
import { Component, ChangeDetectorRef  } from '@angular/core';
import { ApiUsuariosService } from '../../../demo/service/usuarios.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.scss']
})
export class RecuperarComponent {

  constructor(
    private apiUsuarios: ApiUsuariosService,
    private router: Router,
    private toastr : ToastrService,
    public bsModalRef: BsModalRef
  ){}

  correo:string;
  contrasena:string;

  user:any={
    correo:'',
    contrsena:'',
 
  }

  errorMessages={
    correo:'',
    contrasena:'',
    credenciales:'',
    recuperar:''
  }

  loading:boolean=false;

  validarCorreo() {
    
    const validacionCorreo = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;

        // Obtener valores de los campos
        const correo = (document.getElementById('correo') as HTMLInputElement).value;
      

    if (!correo) {
      this.errorMessages.correo = '';
   
    } else if (!validacionCorreo.test(correo)) {
      this.errorMessages.correo = 'El correo debe tener una estructura válida (usuario123@dominio.com).';
   
    } else if (this.user.correo.length > 50) {
      this.errorMessages.correo = 'El correo no debe superar los 50 caracteres.';
     
    }else {
         this.errorMessages.correo = '';
        }
      
    }

    validarContrasena(){
      const validacion = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      const contrasena = (document.getElementById('contrasena') as HTMLInputElement).value;
 
      if(!contrasena){
       this.errorMessages.contrasena=''
      }
      else if(!validacion.test(contrasena)){
       this.errorMessages.contrasena='Minimo 8 caracteres, 1 mayuscula y un simbolo.';
      }else if (this.user.contrasena.length > 50) {
       this.errorMessages.contrasena = 'La contraseña no debe superar los 50 caracteres.';
     }
      else{
       this.errorMessages.contrasena=''
      }
   }
  

   forgotPassword(form: NgForm) {
    // Obtener el valor del campo de correo del formulario
    const correo = form.value.correo;
  
    // Cambiar el estado de loading antes de llamar al servicio
    this.loading = true;
  
    // Llamar al servicio para solicitar el restablecimiento de contraseña
    this.apiUsuarios.forgotPassword({ correo }).subscribe(
      (response) => {
        if (response.message) {
          // Asignar el mensaje de éxito a una propiedad en tu componente
          this.errorMessages.recuperar = response.message;
  
          // Establecer un temporizador para borrar el mensaje y cerrar el modal después de 2 segundos
          setTimeout(() => {
            this.errorMessages.recuperar = '';
            this.cerrarModal(); // Cierra el modal
          }, 2000);
        }
      },
      (error) => {
        console.error('Error en la solicitud para recuperar contraseña:', error);
        if (error.error && error.error.error) {
          this.errorMessages.recuperar = error.error.error;
  
          // Establecer un temporizador para borrar el mensaje y cerrar el modal después de 2 segundos
          setTimeout(() => {
            this.errorMessages.recuperar = '';
            this.cerrarModal(); // Cierra el modal
          }, 2000);
        }
      }
    );
  }
  
  
  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/login']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }


}
