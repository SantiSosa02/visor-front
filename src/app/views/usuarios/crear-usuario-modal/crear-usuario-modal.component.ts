import { Component, ChangeDetectorRef  } from '@angular/core';
import { ApiUsuariosService } from '../../../demo/service/usuarios.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-crear-usuario-modal',
  templateUrl: './crear-usuario-modal.component.html',
  styleUrls: ['./crear-usuario-modal.component.scss']
})
export class CrearUsuarioModalComponent {

  user: any = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
  };


  errorMessages = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena:''
  };
  
loading:boolean = false;

  constructor(
    private apiServices: ApiUsuariosService, 
    private router: Router,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef, 
    private cookieService: CookieService
    ) {}

  confirmarContrasena: string = '';
  camposValidos:boolean=false;
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  
  camposCompletos(): boolean {
    return (
      !!this.user.nombre &&
      !!this.user.apellido &&
      !!this.user.correo &&
      !!this.user.contrasena &&
      !!this.confirmarContrasena &&
      this.user.contrasena === this.confirmarContrasena
    );
  }

  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  
    if (!this.user.nombre) {
      this.errorMessages.nombre = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del nombre
      this.user.nombre = this.user.nombre.trim();
  
      // Reemplazar múltiples espacios entre palabras con un solo espacio
      this.user.nombre = this.user.nombre.replace(/\s+/g, ' ');
  
      // Capitalizar la primera letra de cada palabra
      const palabras = this.user.nombre.split(' ');
      const nombreCapitalizado = palabras.map(
        palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)
      );
  
      // Unir las palabras nuevamente con un solo espacio
      this.user.nombre = nombreCapitalizado.join(' ');
  
      if (!validacion.test(this.user.nombre)) {
        this.errorMessages.nombre = 'El nombre solo acepta letras, un espacio entre palabras y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.user.nombre.length > 50) {
        this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
        this.camposValidos = false;
      } else {
        this.errorMessages.nombre = '';
        this.camposValidos = true;
      }
    }
  }
  
  

  validarApellido() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  
    if (!this.user.apellido) {
      this.errorMessages.apellido = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del apellido
      this.user.apellido = this.user.apellido.trim();
  
      this.user.apellido = this.user.apellido.replace(/\s+/g, ' ');

      // Divide el apellido en palabras
      const palabras = this.user.apellido.split(' ');
  
      // Capitaliza la primera letra de cada palabra
      const apellidoCapitalizado = palabras.map(
        palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1));
  
      // Une las palabras nuevamente
      this.user.apellido = apellidoCapitalizado.join(' ');
  
      if (!validacion.test(this.user.apellido)) {
        this.errorMessages.apellido = 'El apellido solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.user.apellido.length > 50) {
        this.errorMessages.apellido = 'El apellido no debe superar los 50 caracteres.';
        this.camposValidos = false;
      } else {
        this.errorMessages.apellido = '';
        this.camposValidos = true;
      }
    }
  }
  
  validarCorreo() {
    const validacionCorreo = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;
  
    if (!this.user.correo) {
      this.errorMessages.correo = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del correo
      this.user.correo = this.user.correo.trim();
  
      if (!validacionCorreo.test(this.user.correo)) {
        this.errorMessages.correo = 'El correo debe tener una estructura válida (usuario123@dominio.com).';
        this.camposValidos = false;
      } else if (this.user.correo.length > 100) {
        this.errorMessages.correo = 'El correo no debe superar los 100 caracteres.';
        this.camposValidos = false;
      } else {
        const token = localStorage.getItem('token');
        // Verificar si el correo ya existe
        this.apiServices.verificarCorreoExistente(this.user.correo, token).subscribe(
          (response) => {
            if (response.existe) {
              this.errorMessages.correo = 'Este correo ya está en uso por otro usuario.';
              this.camposValidos = false;
            } else {
              this.errorMessages.correo = '';
              this.camposValidos = true;
            }
          },
          (error) => {
            console.error('Error al verificar el correo:', error);
          }
        );
      }
    }
  }
  


  validarContrasena(){
     const validacion = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

     if(!this.user.contrasena){
      this.errorMessages.contrasena=''
      this.camposValidos=false;
     }
     else if(!validacion.test(this.user.contrasena)){
      this.errorMessages.contrasena='Minimo 8 caracteres, 1 mayuscula y un simbolo.';
      this.camposValidos=false;
     }else if (this.user.contrasena.length > 50) {
      this.errorMessages.contrasena = 'La contraseña no debe superar los 50 caracteres.';
      this.camposValidos=false;
    }
     else{
      this.errorMessages.contrasena=''
      this.camposValidos=true;
     }
  }

  validarConfirmarContrasena() {
    const contrasena = this.user.contrasena;
  
    if (contrasena === this.confirmarContrasena) {
        this.errorMessages.confirmarContrasena = '';
        console.log('Las contraseñas coinciden');
    } else {
        this.errorMessages.confirmarContrasena = 'Las contraseñas no coinciden';
        console.log('Las contraseñas no coinciden');
    }
}

registrarUsuario() {
  console.log('Haciendo clic en el botón de Registrar');
  
  if (this.user.contrasena !== this.confirmarContrasena) {
    console.error('Las contraseñas no coinciden');
    return;
  }

  if (!this.user.correo) {
    console.error('El campo de correo está vacío');
    return;
  }
  const token = localStorage.getItem('token');

  this.apiServices.createUser(this.user, token).subscribe(
    (response) => {
      if (response && response.status === 'success') {
        console.log('Registro exitoso');
        this.submit();
        if (response.usuario) {
          console.log('Datos del usuario:', response.usuario);
        }
      } else {
        console.error('Error al registrar el usuario:', response.message);
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
    this.router.navigate(['/usuarios']);
  });
  this.bsModalRef.hide();  // Cierra el modal
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
      this.toastr.success('Empleado registrado con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
      this.cerrarModal();
      this.reloadComponent();

    }
  }
  
}
