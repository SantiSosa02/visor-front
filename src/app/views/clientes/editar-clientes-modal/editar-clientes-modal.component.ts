import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-editar-clientes-modal',
  templateUrl: './editar-clientes-modal.component.html',
  styleUrls: ['./editar-clientes-modal.component.scss']
})
export class EditarClientesModalComponent {

  constructor(
    private apiClientes:ApiClientesService,
    private toastr: ToastrService,
    private router: Router,
    private bsModalRef: BsModalRef,
    private route: ActivatedRoute
  ){
    this.route.params.subscribe(params => {
      this.clientId= +params['id'];
    })
  }

  clientId:number;
  cliente:any;
  datosOriginales:any;
  idcliente:number;

  datosModificados:any={
    nombre:'',
    apellido:'',
    telefono:'',
    correo:'',
    estado:false
  }

  errorMessages={
    nombre:'',
    apellido:'',
    telefono:'',
    correo:''
  }

  loading:boolean=false;
  modalRef: BsModalRef;
  camposValidos:boolean=false;
  token=localStorage.getItem('token');

  camposCompletos():boolean{
    return(
      !!this.datosModificados.nombre &&
      !!this.datosModificados.apellido &&
      !!this.datosModificados.telefono &&
      !!this.datosModificados.correo 
    )
  }

  cambios():boolean{
   if(!this.datosOriginales){
    return false
   }
    return(
      this.datosModificados.nombre !== this.datosOriginales.nombre ||
      this.datosModificados.apellido !== this.datosOriginales.apellido  ||
      this.datosModificados.telefono !== this.datosOriginales.telefono ||
      this.datosModificados.correo !== this.datosOriginales.correo 
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

  
      // Divide el nombre en palabras
      const palabras = this.datosModificados.nombre.split(' ');
  
      // Capitaliza la primera letra de cada palabra
      this.datosModificados.nombre = this.capitalizeFirstLetter(this.datosModificados.nombre);

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
      this.datosModificados.apellido = this.capitalizeFirstLetter(this.datosModificados.apellido);
  
      if (!validacion.test(this.datosModificados.apellido)) {
        this.errorMessages.apellido = 'El apellido solo acepta letras, espacios y letras con acentos (á, é, í, ó, ú).';
        this.camposValidos = false;
      } else if (this.datosModificados.apellido.length > 50) {
        this.errorMessages.apellido = 'El apellido no debe superar los 50 caracteres.';
        this.camposValidos = false;
      }else if (this.datosModificados.apellido.length < 3) {
        this.errorMessages.apellido = 'El apellido no debe ser menor a 3  caracteres.';
        this.camposValidos = false;
      } else {
        this.errorMessages.apellido = '';
        this.camposValidos = true;
      }
    }
  }
  


  validarTelefono(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
  
    // Elimina cualquier caracter que no sea un dígito
    inputValue = inputValue.replace(/\D/g, '');
  
    // Verifica si el campo está vacío y elimina el mensaje de error
    if (inputValue.trim() === '') {
      this.errorMessages.telefono = '';
      this.camposValidos = false;
    } else if (inputValue.length !== 10 || inputValue.startsWith('0')) {
      this.errorMessages.telefono = 'El celular debe tener exactamente 10 dígitos.';
      this.camposValidos = false;
    } else {
     
              this.errorMessages.telefono='';
              this.camposValidos=true;
    }
  
    // Asigna el valor limpio nuevamente al campo de entrada
    inputElement.value = inputValue;
  
    // También actualiza la propiedad vinculada al modelo de datos
    this.datosModificados.telefono = inputValue;
  }
  

  validarCorreo() {
    const validacionCorreo = /^[a-zA-Z0-9._%-ñÑáéíóúÁÉÍÓÚ]{4,}@[a-zA-Z0-9.-]+\.(com|co|org|net|edu)$/;

  
    if (!this.datosModificados.correo) {
      this.errorMessages.correo = '';
      this.camposValidos = false;
    } else {
      // Eliminar espacios en blanco al inicio y al final del correo
      this.datosModificados.correo = this.datosModificados.correo.trim();
  
      if (!validacionCorreo.test(this.datosModificados.correo)) {
        this.errorMessages.correo = 'El correo debe tener una estructura válida (usuario123@dominio.com).';
        this.camposValidos = false;
      } else if (this.datosModificados.correo.length > 100) {
        this.errorMessages.correo = 'El correo no debe superar los 100 caracteres.';
        this.camposValidos = false;
      } else {
        const token = localStorage.getItem('token');
        // Verificar si el correo ya existe
        this.apiClientes.verificarCorreoExistente(this.datosModificados.correo, token).subscribe(
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
  ngOnInit(){
    this.apiClientes.getClientById(this.clientId, this.token).subscribe(
      (data) => {
        if(data){
          this.datosOriginales={
            nombre:data.nombre,
            apellido:data.apellido,
            telefono:data.telefono,
            correo:data.correo,
          }
          this.datosModificados.nombre=data.nombre;
          this.datosModificados.apellido=data.apellido;
          this.datosModificados.telefono=data.telefono;
          this.datosModificados.correo=data.correo;
          this.datosModificados.estado = data.estado;
        }else{
          console.error('No se encontreo el cliente con el ID proporcionado.')
        }
      }
    )
  }

  actualizarCliente(){
    const clienteActualizado = {
      id:this.clientId,
      nombre:this.datosModificados.nombre,
      apellido:this.datosModificados.apellido,
      telefono:this.datosModificados.telefono,
      correo:this.datosModificados.correo,
    };
    this.apiClientes.updateCliente(this.clientId, clienteActualizado, this.token).subscribe(
      (respuesta) => {
        console.log('Respuesta dl servidor', respuesta)
        this.submit();
      }
    )
    console.log(clienteActualizado)
  }

  cerrarModal(){
    this.bsModalRef.onHidden.subscribe(() => {
      this.router.navigate(['/clientes'])
    })
    this.bsModalRef.hide();
  }

  reloadComponent(){
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/',{ skipLocationChange:true }).then(() => {
      this.router.navigate([currentRoute])
    })
  }

  submit(){
    if(!this.loading){
      this.loading=true;
      this.toastr.success('Cliente actualizado con exito', 'Exito', { progressBar:true, timeOut:2000});
      this.cerrarModal();
      this.reloadComponent();
      // setTimeout(() => {
      //   this.loading=false;
      //   this.cerrarModal();
      //   this.reloadComponent();
      // },1000)
    }
  }
}
