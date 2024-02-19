
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
  correoValido: boolean = false;
  

  correoCompleto():boolean{
    return (
      !!this.user.correo 
    )
  }

  validarCorreo() {
    const validacionCorreo = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;
    if (!this.user.correo) {
      this.errorMessages.recuperar = '';
      this.correoValido = false;
    } else if (!validacionCorreo.test(this.user.correo)) {
      this.errorMessages.recuperar = 'El correo debe tener una estructura válida (usuario123@dominio.com).';
      this.correoValido = false;
    } else if (this.user.correo.length > 100) {
      this.errorMessages.recuperar = 'El correo no debe superar los 100 caracteres.';
      this.correoValido = false;
    } else {
      this.errorMessages.recuperar = '';
      this.correoValido = true;
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
   mensajeColor: string;


  
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
                // Establecer el color del mensaje como verde si la operación fue exitosa
                this.mensajeColor = 'green';

                // Establecer un temporizador para borrar el mensaje y cerrar el modal después de 2 segundos
                setTimeout(() => {
                    this.errorMessages.recuperar = '';
                    this.mensajeColor = ''; // Restablecer el color
                    this.cerrarModal1(); // Cierra el modal
                }, 2000);
            }
        },
        (error) => {
            if (error.error && error.error.error) {
                this.errorMessages.recuperar = error.error.error;
                // Establecer el color del mensaje como rojo si hay un error
                if (error.error.error === 'El usuario no esta registrado') {
                    this.mensajeColor = 'red';
                    // Establecer un temporizador para borrar el mensaje después de 2 segundos
                    setTimeout(() => {
                        this.errorMessages.recuperar = '';
                        this.mensajeColor = ''; // Restablecer el color
                    }, 2000);
                } else {
                    // Dejar el color predeterminado si no es un error específico relacionado con el correo
                    if (error.error.error !== 'El usuario no esta registrado.') {
                        this.errorMessages.recuperar = ''; // Borrar cualquier mensaje de error relacionado con el correo
                    }
                    this.mensajeColor = ''; // Restablecer el color
                }
            }
        }
    );
}

  
  
  cerrarModal1() {
    setTimeout(() => {
      this.bsModalRef.onHidden.subscribe(() => {
        // Esta función se ejecutará después de que el modal se haya ocultado completamente
        this.router.navigate(['/login']);
      });
      this.bsModalRef.hide();  // Cierra el modal
    }, 2000); // 2000 milisegundos = 2 segundos
  }
  

  cerrarModal(){
    this.bsModalRef.onHidden.subscribe(() => {
      this.router.navigate(['/login'])
    });
    this.bsModalRef.hide();
  }


}
