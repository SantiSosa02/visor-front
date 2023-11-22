import { Component, inject } from '@angular/core';
import { Router } from '@angular/router'; 
import { ApiCategoriaService } from '../../../demo/service/categorias.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CrearCategoriasModalComponent } from '../crear-categorias-modal/crear-categorias-modal.component';
import { EditarCategoriasModalComponent } from '../editar-categorias-modal/editar-categorias-modal.component';
import { DetalleCategoriaComponent } from '../detalle-categoria/detalle-categoria.component';
import { User } from 'src/app/demo/interfaces';
import { AuthService } from 'src/app/demo/service/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-listar-categorias',
  templateUrl: './listar-categorias.component.html',
  styleUrls: ['./listar-categorias.component.scss']
})
export class ListarCategoriasComponent {

  data: any[] = [];
  estados: { [key: number]: boolean } = {}; // Objeto para mantener los estados de los usuarios
  isConfirmationDialogVisible: boolean = false;

  constructor(
    private apiCategoria: ApiCategoriaService, 
    private router:Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private cookieService: CookieService

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
  paqueteDialog: boolean = false;
  

  abrirPaqueteDialog() {
    this.paqueteDialog = true; // Abre el diálogo al establecer el valor en true
  }

  ngOnInit(): void {
    this.cargarCategorias(true);

  }

  // llenarData() {
  //   this.apiCategoria.getCategorias().subscribe(
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

  cambiarEstadoCategoriaId(categoryId: number, newState: boolean) {
    const token = localStorage.getItem('token');
    this.apiCategoria.updateCategoryState(categoryId, newState,token).subscribe(
      (response) => {
        if (response && response.message === 'Categoria actualizada exitosamente.') {
          this.actualizarEstadoEnLista(categoryId, newState);
        } else {
          console.error('Error al cambiar el estado de la categoria:', response);
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  
  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }
  
  
  // toggleEstado(category: any) {
  //   const categoryId = category.idcategoria;
    
  //   // Guarda el estado actual del interruptor
  //   const estadoAnterior = category.estado;
  
  //   // Deshabilita el interruptor temporalmente
  //   category.estado = !estadoAnterior;
    
  //   // Abre un SweetAlert de confirmación
  //   Swal.fire({
  //     title: 'Confirmar Cambio de Estado',
  //     text: '¿Estás seguro de cambiar el estado de esta categoria?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Aceptar',
  //     confirmButtonColor: '#4CAF50',
  //     cancelButtonText: 'Cancelar',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // Cambia el estado del interruptor solo si el usuario hace clic en "Aceptar"
  //       this.cambiarEstadoCategoriaId(categoryId, !estadoAnterior);
  //       this.toastr.success('Estado del usuario actualizado con éxito', 'Éxito',{
  //         timeOut:1000
  //       });
  //       setTimeout(() => {
  //         this.reloadComponent();
  //       },1000)
  //     } else {
  //       // Si se hace clic en "Cancelar," restaura el estado del interruptor
  //       category.estado = estadoAnterior;
  //     }
  //   });
  // }

  toggleEstado(category: any) {
    const token = localStorage.getItem('token');
    const categoryId = category.idcategoria;
    const estadoAnterior = category.estado;
  
    category.estado = !estadoAnterior;
  
    this.apiCategoria.getProductosRelacioandos(categoryId, token).subscribe(
      (response: any) => {
        console.log('Respuesta del servicio:', response);
  
        // Verificar si la respuesta es válida y tiene la propiedad length
        const cantidadProductos = Array.isArray(response) ? response.length : 0;
  
        // Agregar un console.log para verificar la cantidad de productos
        console.log('Cantidad de productos:', cantidadProductos);
  
        if (cantidadProductos > 0) {
          Swal.fire({
            title: 'Alerta',
            text: 'Esta categoría tiene productos asociados.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          }).then((result) => {
            if (result.isConfirmed) {
              category.estado = estadoAnterior;
            }
          });
        } else {
          Swal.fire({
            title: 'Confirmar Cambio de Estado',
            text: '¿Estás seguro de cambiar el estado de esta categoría?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#4CAF50',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              // Cambia el estado del interruptor solo si el usuario hace clic en "Aceptar"
              this.cambiarEstadoCategoriaId(categoryId, !estadoAnterior);
              this.toastr.success('Estado del usuario actualizado con éxito', 'Éxito', {
                timeOut: 1000
              });
              setTimeout(() => {
                this.reloadComponent();
              }, 1000);
            } else {
              // Si se hace clic en "Cancelar," restaura el estado del interruptor
              category.estado = estadoAnterior;
            }
          });
        }
      },
      (error) => {
        console.error('Error al obtener productos asociados:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al obtener los productos asociados.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
    );
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
      item.nombre.toLowerCase().includes(busquedaMinuscula) 
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
  
  abrirCrearCategoriaModal() {
    this.modalRef = this.modalService.show(CrearCategoriasModalComponent,{
      backdrop: 'static'
    });
  }

  // abrirCrearUsuarioModal() {
  //  this.bsModalRef= this.modalService.show(CrearUsuarioModalComponent);
  // }

  abrirRegistroUsuario() {
     this.router.navigate(['usuarios/crear'])
  }


  abrirModalDeEdicion(idcategoria: number) {
    const initialState = { categoryId: idcategoria };
    this.modalService.show(EditarCategoriasModalComponent, { initialState ,
    backdrop: 'static' });
  }

  abrirModalDetalle(idcategoria: number) {
    const initialState = { categoryId: idcategoria };
    this.modalService.show(DetalleCategoriaComponent, { initialState,
    backdrop: 'static' });
  }
  
  

  cambiarFiltro(activos: boolean) {
    this.filtroActivo = activos;
    this.currentPage = 1; // Actualiza la página a 1 al cambiar el filtro
    this.cargarCategorias(activos);
  }

cargarCategorias(activos: boolean) {
  const token = localStorage.getItem('token');
  if (activos) {
    this.apiCategoria.getActiveCategory(token).subscribe(
      (data: any[]) => {
        this.totalItems = data.length;
        this.datosOriginales = [...data];
        this.actualizarTabla();
        this.noHayUsuariosRegistrados = data.length === 0;
      },
      (error) => {
        this.noHayUsuariosRegistrados = true;
        console.error('Error al obtener categorías activas:', error);
      }
    );
  } else {
    const token = localStorage.getItem('token');
    this.apiCategoria.getInactiveCategory(token ).subscribe(
      (data: any[]) => {
        this.totalItems = data.length;
        this.datosOriginales = [...data];
        this.actualizarTabla();
        this.noHayUsuariosRegistrados = data.length === 0;
      },
      (error) => {
        this.noHayUsuariosRegistrados = true;
        console.error('Error al obtener categorías inactivas:', error);
      }
    );
  }
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

  
get totalPages(): number {
  return Math.ceil(this.totalItems / this.itemsPerPage);
}


}

