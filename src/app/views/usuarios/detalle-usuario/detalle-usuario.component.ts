import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiUsuariosService } from 'src/app/demo/service/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.component.html',
  styleUrls: ['./detalle-usuario.component.scss']
})
export class DetalleUsuarioComponent {


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

  


  ngOnInit() {

    const token = localStorage.getItem('token');
    // Cargar los detalles del usuario al iniciar el componente
    this.apiservice.getUserById(this.userId, token ).subscribe((data) => {
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

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/usuarios']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }
}
