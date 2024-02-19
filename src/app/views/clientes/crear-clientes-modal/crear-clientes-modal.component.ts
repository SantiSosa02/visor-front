import { Component } from '@angular/core';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-crear-clientes-modal',
  templateUrl: './crear-clientes-modal.component.html',
  styleUrls: ['./crear-clientes-modal.component.scss']
})
export class CrearClientesModalComponent {

  constructor(
    private apiClientes: ApiClientesService,
    private router: Router,
    private toastr: ToastrService,
    private bsModalRef: BsModalRef
  ) { }



  client: any = {
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
  }

  errorMessages = {
    nombre: '',
    apellido: '',
    telefono: '',
    correo: ''
  }

  loading: boolean = false;
  camposValidos: boolean = false;
  token = localStorage.getItem('token');


  validarNombre() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  
    if (!this.client.nombre) {
      this.errorMessages.nombre = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del nombre
      this.client.nombre = this.client.nombre.trim();

      this.client.nombre = this.client.nombre.replace(/\s+/g, ' ');

      // Divide el nombre en palabras
      const palabras = this.client.nombre.split(' ');
  
      // Capitaliza la primera letra de cada palabra
      this.client.nombre = this.capitalizeFirstLetter(this.client.nombre);
  
      if (!validacion.test(this.client.nombre)) {
        this.errorMessages.nombre = 'El nombre solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.client.nombre.length > 50) {
        this.errorMessages.nombre = 'El nombre no debe superar los 50 caracteres.';
        this.camposValidos = false;
      }else if (this.client.nombre.length < 3) {
        this.errorMessages.nombre = 'El nombre no debe ser menor a 3 caracteres.';
        this.camposValidos = false;
      } else {
        this.errorMessages.nombre = '';
        this.camposValidos = true;
      }
    }
  }

  capitalizeFirstLetter(str) {
    let result = '';
    let capitalizeNext = true;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (capitalizeNext && /[a-záéíóú]/i.test(char)) {
            // Si se debe capitalizar el próximo carácter y el carácter actual es una letra
            result += char.toUpperCase();
            capitalizeNext = false;
        } else {
            // Si no se debe capitalizar el próximo carácter o el carácter actual no es una letra
            result += char.toLowerCase();
            if (char === 'ñ' || char === 'Ñ') {
                capitalizeNext = false; // Evitar que se capitalice la siguiente letra
            } else if (char === ' ') {
                capitalizeNext = true; // Restaurar la capitalización para la próxima palabra
            }
        }
    }

    return result;
}
  validarApellido() {
    const validacion = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  
    if (!this.client.apellido) {
      this.errorMessages.apellido = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del apellido
      this.client.apellido = this.client.apellido.trim();
      
      this.client.apellido = this.client.apellido.replace(/\s+/g, ' ');

      // Divide el apellido en palabras
      const palabras = this.client.apellido.split(' ');
  
      // Capitaliza la primera letra de cada palabra
      this.client.apellido = this.capitalizeFirstLetter(this.client.apellido);  
  
      if (!validacion.test(this.client.apellido)) {
        this.errorMessages.apellido = 'El apellido solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.client.apellido.length > 50) {
        this.errorMessages.apellido = 'El apellido no debe superar los 50 caracteres.';
        this.camposValidos = false;
      }else if (this.client.apellido.length < 3) {
        this.errorMessages.apellido = 'El apellido ser menor a 3 caracteres.';
        this.camposValidos = false;
      } else {
        this.errorMessages.apellido = '';
        this.camposValidos = true;
      }
    }
  }
  
  


  validarTelefono(event: Event) {
    console.log('validando');
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');

    // Aplica la validación de números mayores a 0 y longitud de 10
    const validacion = /^[1-9][0-9]{9}$/; // Esto valida exactamente 10 dígitos

    if (inputValue && !validacion.test(inputValue)) {
      // Si no pasa la validación, puedes mostrar un mensaje de error
      this.errorMessages.telefono = 'El celular debe tener exactamente 10 dígitos.';
      this.camposValidos = false;
    } else {
      // Si pasa la validación, elimina el mensaje de error
      this.errorMessages.telefono = '';
      this.camposValidos = true;

      (error) => {
        console.error('Error al verificar el teléfono:', error);
      }
    }
    // Asigna el valor limpio nuevamente al campo de entrada
    inputElement.value = inputValue;
  }

  validarCorreo() {
    const validacionCorreo = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]{4,}@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;

  
    if (!this.client.correo) {
      this.errorMessages.correo = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del correo
      this.client.correo = this.client.correo.trim();
  
      if (!validacionCorreo.test(this.client.correo)) {
        this.errorMessages.correo = 'El correo debe tener una estructura válida (usuario123@dominio.com) y minimo 4 caracteres antes del @. ';
        this.camposValidos = false;
      } else if (this.client.correo.length > 100) {
        this.errorMessages.correo = 'El correo no debe superar los 100 caracteres.';
        this.camposValidos = false;
      }else if (this.client.correo.length < 15) {
        this.errorMessages.correo = 'El correo no debe ser menor a 10 caracteres.';
        this.camposValidos = false;
      } else {
        const token = localStorage.getItem('token');
        // Verificar si el correo ya existe
        this.apiClientes.verificarCorreoExistente(this.client.correo, token).subscribe(
          (response) => {
            if (response.existe) {
              this.errorMessages.correo = 'Este correo ya está en uso por otro cliente.';
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

    camposCompletos():boolean{
      return (
        !!this.client.nombre &&
        !!this.client.apellido &&
        !!this.client.telefono &&
        !!this.client.correo
      )
    }



    registrarCliente(){
      console.log('Haciendo clic en el boton de registrar.')
      this.apiClientes.createClient(this.client, this.token).subscribe(
        (response) => {
          if (response && response.status === 'success') {
            console.log('Registro exitoso.')
            this.submit();
            if (response.client) {
              console.log('Datos de el cliente', response.client)
            }
          } else {
            console.error('Error al registrar el cliente.', response.message)
          }
        },
        (error) => {
          console.error('Error en la solicitud', error)
        }
      )
    }

    cerrarModal(){
      this.bsModalRef.onHidden.subscribe(() => {
        this.router.navigate(['/clientes'])
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
        this.toastr.success('Cliente registrado con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
        this.cerrarModal();
        this.reloadComponent();
      }
    }

  }
