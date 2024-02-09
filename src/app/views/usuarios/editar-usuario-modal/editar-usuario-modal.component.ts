import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiUsuariosService } from 'src/app/demo/service/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuario-modal.component.html',
  styleUrls: ['./editar-usuario-modal.component.scss']
})
export class EditarUsuarioModalComponent {

  userId: number;
  usuario: any; // Aquí deberías definir la estructura de datos para el usuario
  contrasenaActual: string;  // Variable para almacenar la contraseña actual
  contrasenaAnteriorValida: boolean = false;
  datosOriginales:any;
  idusuario: number;


datosModificados:any ={
    nombre:'',
    apellido:'',
    correo:'',
    contrasena:'',
    contrasenaAnterior:'',
    estado:false
}

errorMessages = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena:'',
    contrasenaAnterior:''
  };
  
loading:boolean = false;
modalRef: BsModalRef;
camposValidos:boolean=false;

  constructor(private route: ActivatedRoute,
    private apiservice : ApiUsuariosService,
    private toastr: ToastrService,
    private router : Router,
    public bsModalRef: BsModalRef,
    private cookieService : CookieService
    ) 
    {
    this.route.params.subscribe(params => {
      this.userId = +params['id']; // El "+" convierte el valor en un número
    });
  }

  // confirmarContrasena: string = '';
  
  camposCompletos(): boolean {
    return (
      !!this.datosModificados.nombre &&
      !!this.datosModificados.apellido &&
      !!this.datosModificados.correo 
    );
  }

  // contrasenasCompletas(): boolean {
  //   return (
  //     !!this.datosModificados.contrasena &&
  //     !!this.confirmarContrasena &&
  //     this.datosModificados.contrasena === this.confirmarContrasena
  //   );
  // }

  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
    
    if (!this.datosModificados.nombre) {
      this.errorMessages.nombre = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del nombre
      this.datosModificados.nombre = this.datosModificados.nombre.trim();
  
      this.datosModificados.nombre = this.datosModificados.nombre.replace(/\s+/g, ' ');

      // Divide el nombre en palabras
      const palabras = this.datosModificados.nombre.split(' ');
    
      // Capitaliza la primera letra de cada palabra
      const nombreCapitalizado = palabras.map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1));
    
      // Une las palabras nuevamente
      this.datosModificados.nombre = nombreCapitalizado.join(' ');
    
      if (!validacion.test(this.datosModificados.nombre)) {
        this.errorMessages.nombre = 'El nombre solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.datosModificados.nombre.length > 50) {
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
    
    if (!this.datosModificados.apellido) {
      this.errorMessages.apellido = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del apellido
      this.datosModificados.apellido = this.datosModificados.apellido.trim();
  
      this.datosModificados.apellido = this.datosModificados.apellido.replace(/\s+/g, ' ');

      // Divide el apellido en palabras
      const palabras = this.datosModificados.apellido.split(' ');
    
      // Capitaliza la primera letra de cada palabra
      const apellidoCapitalizado = palabras.map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1));
    
      // Une las palabras nuevamente
      this.datosModificados.apellido = apellidoCapitalizado.join(' ');
    
      if (!validacion.test(this.datosModificados.apellido)) {
        this.errorMessages.apellido = 'El apellido solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.datosModificados.apellido.length > 50) {
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

  if (!this.datosModificados.correo) {
    this.errorMessages.correo = '';
    this.camposValidos=false;
  } else if (!validacionCorreo.test(this.datosModificados.correo)) {
    this.errorMessages.correo = 'El correo debe tener una estructura válida (usuario123@dominio.com).';
    this.camposValidos=false;
  } else if (this.datosModificados.correo.length > 100) {
    this.errorMessages.correo = 'El correo no debe superar los 50 caracteres.';
    this.camposValidos = false;
  } else {
    
    const token = localStorage.getItem('token');
    if (this.datosModificados.correo !== this.datosOriginales.correo) {
      this.apiservice.verificarCorreoExistente(this.datosModificados.correo, token).subscribe(
        (response) => {
          if (response.existe) {
            this.errorMessages.correo = 'Este correo ya está en uso por otro usuario.';
            this.camposValidos=false;
          } else {
            this.errorMessages.correo = '';
            this.camposValidos=true;
          }
        },
        (error) => {
          console.error('Error al verificar el correo:', error);
        }
      );
    } else {
      // Si el correo es el mismo que el del cliente actual, no mostramos el mensaje de error
      this.errorMessages.correo = '';
    }
  }
}


  validarContrasena(){
     const validacion = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

     if(!this.datosModificados.contrasena){
      this.errorMessages.contrasena=''
     }
     else if(!validacion.test(this.datosModificados.contrasena)){
      this.errorMessages.contrasena='La contraseña no cumple con los requisitos, minimo 8 caracteres, 1 mayuscula y un simbolo.'
     }else if (this.datosModificados.contrasena.length > 50) {
      this.errorMessages.contrasena = 'La contraseña no debe superar los 50 caracteres.';
    }
     else{
      this.errorMessages.contrasena=''
     }
  }

//   validarConfirmarContrasena() {
//     const contrasena = this.datosModificados.contrasena;
  
//     if (contrasena === this.confirmarContrasena) {
//         this.errorMessages.confirmarContrasena = '';
//         console.log('Las contraseñas coinciden');
//     } else {
//         this.errorMessages.confirmarContrasena = 'Las contraseñas no coinciden';
//         console.log('Las contraseñas no coinciden');
//     }
// }

// validarContrasenaAnterior() {
//   if (!this.datosModificados.contrasenaAnterior) {
//     this.errorMessages.contrasenaAnterior = '';
//     this.contrasenaAnteriorValida = false; // Contraseña anterior no válida
//     // Limpia los campos de contraseña y confirmar contraseña
//     this.datosModificados.contrasena = '';
//     this.confirmarContrasena = '';
//     this.errorMessages.contrasena = ''; // Limpia el mensaje de error de contraseña
//     this.errorMessages.confirmarContrasena = ''; // Limpia el mensaje de error de confirmar contraseña
//   } else if (this.datosModificados.contrasenaAnterior !== this.contrasenaActual) {
//     this.errorMessages.contrasenaAnterior = 'La contraseña no coincide con la contraseña actual';
//     this.contrasenaAnteriorValida = false; // Contraseña anterior no válida
//     this.errorMessages.contrasena = ''; // Limpia el mensaje de error de contraseña
//     this.errorMessages.confirmarContrasena = ''; // Limpia el mensaje de error de confirmar contraseña
//   } else {
//     this.errorMessages.contrasenaAnterior = '';
//     this.contrasenaAnteriorValida = true; // Contraseña anterior válida
//   }
// }

cambios(): boolean {
  if (!this.datosOriginales) {
    return false;
  }

  const nombreCambiado = this.datosModificados.nombre !== this.datosOriginales.nombre;
  const apellidoCambiado = this.datosModificados.apellido !== this.datosOriginales.apellido;
  const correoCambiado = this.datosModificados.correo !== this.datosOriginales.correo;

  return nombreCambiado || apellidoCambiado || correoCambiado;
}


  ngOnInit() {
    const token = localStorage.getItem('token');
    // Cargar los detalles del usuario al iniciar el componente
    this.apiservice.getUserById(this.userId, token).subscribe((data) => {
        if (data) {

          this.datosOriginales={
            nombre:data.nombre,
            apellido:data.apellido,
            correo:data.correo
          };
          
          this.datosModificados.nombre = data.nombre ;
          this.datosModificados.apellido = data.apellido ;
          this.datosModificados.correo = data.correo ;
          this.datosModificados.estado = data.estado ;
          this.contrasenaActual = data.contrasena;
      
          // Realiza cualquier otra lógica que necesites con los datos del usuario
        } else {
          // Manejar el caso en que no se encontraron datos del usuario
          console.error('No se encontraron datos del usuario con el ID proporcionado.');
        }
      });
  }

  actualizarUsuario() {
    // Crea un objeto con los campos que deseas actualizar
    const usuarioActualizado = {
      id: this.userId,
      nombre: this.datosModificados.nombre,
      apellido: this.datosModificados.apellido,
      correo: this.datosModificados.correo,
      estado: this.datosModificados.estado,
    };
    const token = localStorage.getItem('token');
  
    this.apiservice.updateUser(this.userId, usuarioActualizado ,token).subscribe((respuesta) => {
      // Manejar la respuesta del servidor, por ejemplo, mostrar un mensaje de éxito o error
      console.log('Respuesta del servidor:', respuesta);
      this.submit();
    });
    console.log(usuarioActualizado);
  }

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/usuarios']);
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
    this.toastr.success('Empleado actualizado con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
    this.cerrarModal();
    this.reloadComponent();
  }
}

  
}