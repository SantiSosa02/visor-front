import { Component } from '@angular/core';
import { ApiUsuariosService } from '../../../demo/service/usuarios.service';
import { Router } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CrearUsuarioModalComponent } from '../crear-usuario-modal/crear-usuario-modal.component';
import { EditarUsuarioModalComponent } from '../editar-usuario-modal/editar-usuario-modal.component';
import { DetalleUsuarioComponent } from '../detalle-usuario/detalle-usuario.component';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/demo/service/auth.service';


@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.scss']
})
export class ListarUsuariosComponent {
  data: any[] = [];
  estados: { [key: number]: boolean } = {}; // Objeto para mantener los estados de los usuarios

  constructor(
    private apiserviceusuario: ApiUsuariosService, 
    private router:Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private cookieService : CookieService,
    private authService: AuthService,

    ) 
     {
      
  }

  busqueda: string = '';
  datosOriginales: any[] = [];


  totalItems: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  noHayUsuariosRegistrados: boolean = true;
  filtroActivo: boolean = true; 
  modalRef: BsModalRef;
  currentUser: any; 
  token = this.cookieService.get('token');

  ngOnInit(): void {
    this.cargarUsuarios(true);
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });
  }

  
  // llenarData() {
  //   this.apiserviceusuario.getUsuarios().subscribe(
  //     (data) => {
  //       this.totalItems = data.length;
  //       this.datosOriginales = [...data];
  //       this.actualizarTabla();
  //       this.noHayUsuariosRegistrados = data.length === 0;
  //     },
  //     (error) => {
  //       if (error.status === 404) {
  //         // El servidor respondió con un estado 404 (Not Found), lo que significa que no hay usuarios registrados.
  //         this.noHayUsuariosRegistrados = true;
  //       } else {
  //         // Elimina o comenta la siguiente línea para evitar mensajes de error en la consola
  //         // console.error('Error al obtener usuarios:', error);
  //       }
  //     }
  //   );
  // }

  cambiarEstadoUsuario(userId: number, newState: boolean) {
    const token = localStorage.getItem('token');
    if (token) {
      this.apiserviceusuario.updateUserState(userId, newState, token).subscribe(
        (response) => {
          if (response && response.message === 'Estado del usuario actualizado exitosamente.') {
            this.actualizarEstadoEnLista(userId, newState);
          } else {
            console.error('Error al cambiar el estado del usuario:', response);
          }
        },
        (error) => {
          console.error('Error en la solicitud:', error);
        }
      );
    } else {
      console.error('No se encontró el token en el localStorage.');
    }
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }
  
  cambiarFilasPorPagina() {
    // Asegúrate de que currentPage sea válido después del cambio
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, totalPages);
  
    // Recalcula itemsPerPage después del cambio
    this.itemsPerPage = +this.itemsPerPage; // Convierte a número
  
    // Actualiza la tabla con la nueva configuración
    this.actualizarTabla();
  }
  
  toggleEstado(user: any) {
    const userId = user.idusuario;
    const estadoAnterior = user.estado;

    // Utiliza this.currentUser para obtener el usuario actual
    const usuarioAutenticado = this.currentUser;

    // Verifica si el usuario que intenta deshabilitar es el mismo que el usuario autenticado
    if (usuarioAutenticado && usuarioAutenticado.idusuario === userId) {
      Swal.fire({
        title: 'Advertencia',
        text: 'No puedes deshabilitar tu propia cuenta',
        icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
      })
      .then((result) => {
        if (result.isConfirmed) {
          user.estado = estadoAnterior;
        }
      });
    }

    user.estado = !estadoAnterior;

    // Verifica si el usuario es diferente antes de mostrar el SweetAlert
    if (usuarioAutenticado && usuarioAutenticado.idusuario !== userId) {
      Swal.fire({
        title: 'Confirmar Cambio de Estado',
        text: '¿Estás seguro de cambiar el estado de este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4CAF50',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
           // Cambia el estado del interruptor solo si el usuario hace clic en "Aceptar"
           this.cambiarEstadoUsuario(userId, !estadoAnterior);
           this.toastr.success('Estado del usuario actualizado con éxito', 'Éxito', {
             timeOut: 1000
           });
           setTimeout(() => {
             this.reloadComponent();
           }, 1000);
        } else {
          user.estado = estadoAnterior;
        }
      });
    }
  }

  actualizarEstadoEnLista(userId: number, newState: boolean) {
    this.estados[userId] = newState;
    const usuarioIndex = this.data.findIndex(user => user.idusuario === userId);
    if (usuarioIndex !== -1) {
      this.data[usuarioIndex].estado = newState;
    }
  }

  actualizarTabla(): void {
    const busquedaMinuscula = this.busqueda.toLowerCase();
  
    // Filtrar todos los usuarios, tanto activos como inactivos
    const usuariosFiltrados = this.datosOriginales.filter(item => {
      return (
        item.nombre.toLowerCase().includes(busquedaMinuscula) ||
        item.apellido.toLowerCase().includes(busquedaMinuscula) ||
        item.correo.toLowerCase().includes(busquedaMinuscula)
      );
    });
  
  
    // Aplicar paginación a los usuarios filtrados
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.data = usuariosFiltrados.slice(startIndex, endIndex);
  }



  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.actualizarTabla();
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.actualizarTabla();
    }
  }
  

  abrirCrearUsuarioModal() {
   this.bsModalRef= this.modalService.show(CrearUsuarioModalComponent,{
    backdrop: 'static',
   });
  }

  abrirRegistroUsuario() {
     this.router.navigate(['usuarios/crear'])
  }

  abrirModalDetalle(idUsuario: number) {
    const initialState = { userId: idUsuario };
    this.modalService.show(DetalleUsuarioComponent, { initialState,
    backdrop: 'static' });
  }


  abrirModalDeEdicion(idUsuario: number) {
    const initialState = { userId: idUsuario };
    this.modalService.show(EditarUsuarioModalComponent, { initialState,
    backdrop: 'static' });
  }
  

  cambiarFiltro(activos: boolean) {
    this.filtroActivo = activos;
    this.currentPage = 1; // Actualiza la página a 1 al cambiar el filtro
    this.cargarUsuarios(activos);
  }

  cargarUsuarios(activos: boolean) {
    const token = localStorage.getItem('token');
    if (activos) {
      this.apiserviceusuario.getUsuariosActivos(token).subscribe(
        (data: any[]) => {
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayUsuariosRegistrados = data.length === 0;
        },
        (error) => {
          this.noHayUsuariosRegistrados = true;
          // console.error('Error al obtener usuarios activos:', error);
          this.toastr.warning('No hay usuarios activos', 'Advertencia');
        }
      );
    } else {
      const token = localStorage.getItem('token');
      this.apiserviceusuario.getUsuariosInactivos(token).subscribe(
        (data: any[]) => {
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayUsuariosRegistrados = data.length === 0;
        },
        (error) => {
          this.noHayUsuariosRegistrados = true;
          // console.error('Error al obtener usuarios inactivos:', error);
          this.toastr.warning('No hay usuarios inactivos', 'Advertencia');
        }
      );
    }
  }
  
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
}
