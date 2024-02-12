
import { NgForm } from '@angular/forms';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { ApiUsuariosService } from '../../../demo/service/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RecuperarComponent } from '../recuperar/recuperar.component';
import { AuthService } from 'src/app/demo/service/auth.service'; 
import { ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);


  constructor(
    private apiUsuarios: ApiUsuariosService,
    private toastr : ToastrService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private cookieService: CookieService
  ){}


  public myForm: FormGroup = this.fb.group({
    correo: ['santiago@gmail.com', [Validators.required, Validators.email]],
    contrasena: ['Santi123.', [Validators.required, Validators.minLength(6)]],
});

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

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validarCorreo() {
    const validacionCorreo = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;

        // Obtener valores de los campos
        const correo = (document.getElementById('correo') as HTMLInputElement).value;
      

    if (!correo) {
      this.errorMessages.correo = '';
   
    } else if (!validacionCorreo.test(correo)) {
      this.errorMessages.correo = 'El correo debe tener una estructura válida (usuario123@dominio.com).';
   
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
      }
      else{
       this.errorMessages.contrasena=''
      }
   }
  
  
   login() {
    const correo = (document.getElementById('correo') as HTMLInputElement).value;
    const contrasena = (document.getElementById('contrasena') as HTMLInputElement).value;
      
    if (!correo || !contrasena) {
      console.error('Credenciales inválidas.');
      this.errorMessages.credenciales = 'Credenciales inválidas.';
      setTimeout(() => {
        this.errorMessages.credenciales = '';
      }, 2000);
      return;
    }
  
    this.authService.login(correo, contrasena).subscribe({
      next: () => {
        // Muestra el toaster de éxito
        this.toastr.success('Inicio de sesión exitoso', 'Éxito');
        
        // Redirige después de 2 segundos
        setTimeout(() => {
          this.router.navigateByUrl('/index');
        }, 1000);
      },
      error: (error) => {
        console.error('Error del servidor:', error);
      
        if (error.status === 401) {
          console.log('No autorizado - Redireccionando a la página de inicio de sesión...');
          this.errorMessages.credenciales = 'Usuario o contraseña incorrectos.';
        } else if (error.errorType === 'inactiveUser') {
          this.errorMessages.credenciales = 'El usuario está inactivo.'; 
          setTimeout(() =>{
            this.errorMessages.credenciales = '';
          }, 2000);
        } else if (error.errorType === 'notRegisteredUser') {
          // Mostrar mensaje cuando el usuario no está registrado
          this.errorMessages.credenciales = error.message; 
          setTimeout(() =>{
            this.errorMessages.credenciales = '';
          }, 2000);
        } else {
          // Manejo de otros casos de error
          this.errorMessages.credenciales = 'Credenciales inválidas.';
          setTimeout(() => {
            this.errorMessages.credenciales = '';
          }, 2000);
        }
      },
    });
  }
  
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
  
  
  

  forgotPassword(form: NgForm) {
    // Obtener el valor del campo de correo del formulario
    const correo = form.value.correo;
    console.log(correo)

    // Llamar al servicio para solicitar el restablecimiento de contraseña
    this.apiUsuarios.forgotPassword({ correo }).subscribe(
      (response) => {
        console.log('Respuesta del servidor para recuperar contraseña:', response);
        if (response.message) {
          // Asignar el mensaje de éxito a una propiedad en tu componente
          this.errorMessages.recuperar = response.message;
  
          // Establecer un temporizador para borrar el mensaje después de 2 segundos
          setTimeout(() => {
            this.errorMessages.recuperar = '';
            
            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
              this.cerrarModal();
            }, 2000);
          }, 2000);
        }

      },
      (error) => {
        console.error('Error en la solicitud para recuperar contraseña:', error);
        if (error.error && error.error.error) {
            this.errorMessages.recuperar = error.error.error;
            setTimeout(() => {
              this.errorMessages.recuperar = '';
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

  abrirRecuperar() {
    this.bsModalRef= this.modalService.show(RecuperarComponent);
   }
   
}
