import { Component, OnInit } from '@angular/core';
import { ApiServiciosService } from 'src/app/demo/service/servicios.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CrearServiciosModalComponent } from '../crear-servicios-modal/crear-servicios-modal.component';
import { EditarServiciosModalComponent } from '../editar-servicios-modal/editar-servicios-modal.component';
import { DetalleServicioComponent } from '../detalle-servicio/detalle-servicio.component';



@Component({
  selector: 'app-listar-servicios',
  templateUrl: './listar-servicios.component.html',
  styleUrls: ['./listar-servicios.component.scss']
})
export class ListarServiciosComponent implements OnInit {

  data: any[] = [];
  estados:{[key:number]: boolean} = {};
  isConfirmationDialog: boolean = false;

  constructor(
    private apiServicio: ApiServiciosService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ){}

  busqueda:string='';
  datosOriginales: any[] = [];
  totalItems: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  noHayServiciosRegistrados: boolean = true;
  filtroActivo: boolean = true; 
  modalRef: BsModalRef;
  token=localStorage.getItem('token')

  ngOnInit(){
    this.cargarServicios(true);
  }

  // llenarData(){
  //   this.apiServicio.getServices().subscribe(
  //     (data) =>{
  //       this.totalItems = data.length;
  //       this.datosOriginales = [...data];
  //       this.actualizarTabla();
  //       this.noHayServiciosRegistrados= data.length === 0;
  //     },
  //     (error)=>{
  //       if(error.status === 404){
  //         this.noHayServiciosRegistrados=true;
  //       }else{
  //         console.log('Error al obtener los servicios',error)
  //       }
  //     }
  //   )
  // }

  cambiarEstadoServicio(serviceId:number, newState: boolean){
    this.apiServicio.updateServiceState(serviceId, newState,this.token).subscribe(
      (response)=>{
        if(response && response.message === ' Estado del servicio actualizado exitosamente.'){
          this.actualizarEstadoEnLista(serviceId, newState);
        }else{
          console.error('Error al cambiar el estado del servicio.',response)
        }
      },
      (error)=>{
        console.error('Error en la solicitud.', error)
      }
    )
  }

  actualizarEstadoEnLista(serviceId:number, newState:boolean){
    this.estados[serviceId]=newState;
    const servicioIndex= this.data.findIndex(service => service.idservicio === serviceId);
    if(servicioIndex !== -1){
      this.data[servicioIndex].estado= newState;
    }
  }

  cargarServicios(activos: boolean) {

    if (activos) {
      this.apiServicio.getServiciosActivos(this.token).subscribe(
        (data: any[]) => {
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayServiciosRegistrados = data.length === 0;
        },
        (error) => {
          this.noHayServiciosRegistrados = true;
          // console.error('Error al obtener servicios activos:', error);
          this.toastr.warning('No hay servicios activos', 'Advertencia');
        }
      );
    } else {
      this.apiServicio.getServiciosInactivos(this.token).subscribe(
        (data: any[]) => {
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayServiciosRegistrados = data.length === 0;
        },
        (error) => {
          this.noHayServiciosRegistrados = true;
          // console.error('Error al obtener servicios inactivos:', error);
          this.toastr.warning('No hay servicios inactivos', 'Advertencia');
        }
      );
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

  cambiarFiltro(activos: boolean) {
    this.filtroActivo = activos;
    this.currentPage = 1; // Actualiza la página a 1 al cambiar el filtro
    this.cargarServicios(activos);
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
 
   toggleEstado(service: any) {
    const serviceId = service.idservicio;
    
    // Guarda el estado actual del interruptor
    const estadoAnterior = service.estado;
  
    // Deshabilita el interruptor temporalmente
    service.estado = !estadoAnterior;
    
    // Abre un SweetAlert de confirmación
    Swal.fire({
      title: 'Confirmar Cambio de Estado',
      text: '¿Estás seguro de cambiar el estado de este servicio?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#4CAF50',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Cambia el estado del interruptor solo si el usuario hace clic en "Aceptar"
        this.cambiarEstadoServicio(serviceId, !estadoAnterior);
        this.toastr.success('Estado del servicio actualizado con éxito', 'Éxito',{
          timeOut:1000
        });
        setTimeout(() => {
          this.reloadComponent();
        },1000)
      } else {
        // Si se hace clic en "Cancelar," restaura el estado del interruptor
        service.estado = estadoAnterior;
      }
    });
  }

   reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }

  abrirCrearServicioModal() {
    this.bsModalRef= this.modalService.show(CrearServiciosModalComponent,{
      backdrop:'static',
      keyboard:false
    });
   }

   abrirModalDeEdicion(idservicio: number) {
    const initialState = { serviceId: idservicio };
    this.modalService.show(EditarServiciosModalComponent, { initialState,
    backdrop:'static',
    keyboard:false
   });
    //console.log(idservicio)
  }

  abrirModalDetalle(idservicio: number) {
    const initialState = { serviceId: idservicio };
    this.modalService.show(DetalleServicioComponent, { initialState,
    backdrop:'static' });
    console.log(idservicio)
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
