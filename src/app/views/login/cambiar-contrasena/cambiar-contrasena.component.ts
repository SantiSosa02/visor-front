import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiUsuariosService } from 'src/app/demo/service/usuarios.service';


@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.scss']
})
export class CambiarContrasenaComponent {
  token: string;
  newPassword: string;
  passworsdChange:boolean=false;
  confirmarContrasena: string = '';
  camposHabilitados = true; 

  constructor(
    private route: ActivatedRoute,
    private apiUsuarios: ApiUsuariosService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    // Obtener el token de la URL
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }


  errorMessages={
    contrasena:'',
    confirmarContrasena:'',
    recuperar:''
  }

camposValidos:boolean=false;
showPassword = false;

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}


camposCompletos(): boolean {
  return (
    !!this.newPassword &&
    !!this.confirmarContrasena  
  );
}

  validarContrasena() {
    const validacion = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  
    if (!this.newPassword) {
      this.errorMessages.contrasena = '';
      this.camposValidos=false;
    } else if (!validacion.test(this.newPassword)) {
      this.errorMessages.contrasena = 'Mínimo 8 caracteres, 1 mayúscula y un símbolo.';
      this.camposValidos=false;
    } else if (this.newPassword.length > 50) {
      this.errorMessages.contrasena = 'La contraseña no debe superar los 50 caracteres.';
      this.camposValidos=false;
    } else {
      this.errorMessages.contrasena = '';
      this.camposValidos=true;

    }
  }
  

  validarConfirmar() {
    const contrasena = this.newPassword;
    const confirmar = this.confirmarContrasena;
    
    if (confirmar === null || confirmar.trim() === '') {
      this.errorMessages.confirmarContrasena = '';
      this.camposValidos = false;
    } else if (contrasena === confirmar) {
      this.errorMessages.confirmarContrasena = '';
      this.camposValidos = true;
      console.log('Las contraseñas coinciden');
    } else if (!confirmar) {
      this.errorMessages.confirmarContrasena = '';
      this.camposValidos = false;
    } else {
      this.errorMessages.confirmarContrasena = 'Las contraseñas no coinciden';
      this.camposValidos = false;
    }
  }
  
  

  changePassword() {
    // Llamar al servicio para cambiar la contraseña
    this.apiUsuarios.changePassword(this.token, this.newPassword).subscribe(
      (response) => {
        console.log('Respuesta del servidor para cambiar contraseña:', response);
        if (response.message) {
          // Asignar el mensaje de éxito a una propiedad en tu componente
      
          // Mostrar el mensaje de éxito usando Toastr
          this.toastr.success(response.message);
      
          // Establecer un temporizador para borrar el mensaje después de 2 segundos
          setTimeout(() => {
            
            this.camposHabilitados = false;
            this.newPassword = '';
            this.confirmarContrasena = '';
          }, 2000);
        }
        this.passworsdChange = true;
      },
      (error) => {
        console.error('Error en la solicitud para cambiar contraseña:', error);
        if (error.error && error.error.error) {
          this.errorMessages.recuperar = error.error.error;
          setTimeout(() => {
            this.errorMessages.recuperar = '';
          }, 2000);
        }
      }
    );
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }
  
}

