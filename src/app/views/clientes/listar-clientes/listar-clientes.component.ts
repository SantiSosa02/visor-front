import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2'
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CrearClientesModalComponent } from '../crear-clientes-modal/crear-clientes-modal.component';
import { EditarClientesModalComponent } from '../editar-clientes-modal/editar-clientes-modal.component';
import { DetalleClienteComponent } from '../detalle-cliente/detalle-cliente.component';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-listar-clientes',
  templateUrl: './listar-clientes.component.html',
  styleUrls: ['./listar-clientes.component.scss']
})
export class ListarClientesComponent {

  constructor(
    private apiClientes: ApiClientesService,
    private router: Router,
    private toastr: ToastrService, 
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
  ){
  }
  

  data:any[] = [];
  estados:{[key:number]:boolean} = {};
  busqueda: string = '';
  datosOriginales: any[] = [];
  totalItems: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  noHayClientesRegistrados: boolean = true;
  filtroActivo: boolean = true; 
  modalRef: BsModalRef;
  token = localStorage.getItem('token');

  ngOnInit(){
    this.cargarClientes(true);
  }

  actualizarTabla():void {
    const busquedaMinuscula = this.busqueda.toLocaleLowerCase();
    const clientesFiltrados = this.datosOriginales.filter(item => {
      return (
        item.nombre.toLowerCase().includes(busquedaMinuscula) ||
        item.apellido.toLowerCase().includes(busquedaMinuscula) ||
        item.correo.toLowerCase().includes(busquedaMinuscula) ||
        item.telefono.toString().includes(busquedaMinuscula)
      );
    });

    const startIndex = ( this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.data = clientesFiltrados.slice(startIndex, endIndex);
  }

  cargarClientes(activos: boolean){
    if(activos){
      this.apiClientes.getClientesActivos(this.token).subscribe(
        (data: any[]) => {
          this.totalItems= data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayClientesRegistrados = data.length === 0;
        },
        (error) => {
          this.noHayClientesRegistrados = true;
          console.error('Error al obtener los clientes activos:', error)
          this.toastr.warning('No hay clientes activos', 'Advertencia');
        }
      )
    }else{
      this.apiClientes.getClientesInactivos(this.token).subscribe(
        (data : any[]) => {
          this.totalItems = data.length;
          this.datosOriginales= [...data];
          this.actualizarTabla();
          this.noHayClientesRegistrados = data.length === 0;
        
        },
        (error) => {
          this.noHayClientesRegistrados =  true;
          console.error('Error al obtener los clientes inactivos:', error)
          this.toastr.warning('No hay clientes inactivos', 'Advertencia');

        }
      )
    }
  }

  cambiarFiltro(activos: boolean) {
    this.filtroActivo = activos;
    this.currentPage = 1; // Actualiza la página a 1 al cambiar el filtro
    this.cargarClientes(activos);
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

  cambiarEstadoCliente(clientId:number, newState:boolean){
    this.apiClientes.updateUserState(clientId, newState, this.token).subscribe(
      (response) => {
        if(response && response.message === 'Estado del cliente actualizado exitosamente.'){
          this.actualizarEstadoEnLista(clientId, newState);
        }else{
          console.error('Error al cambiar el estado del cliente: ', response)
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error)
      }
    )
  }

  abrirCrearClienteModal() {
    this.bsModalRef= this.modalService.show(CrearClientesModalComponent,{
      backdrop:'static'
    });
   }

   abrirModalDeEdicion(idcliente: number) {
    const initialState = { clientId: idcliente };
    this.modalService.show(EditarClientesModalComponent, { initialState,
    backdrop:'static' });
  }

  abrirModalDetalle(idcliente: number) {
    const initialState = { clientId: idcliente };
    this.modalService.show(DetalleClienteComponent, { initialState,
    backdrop:'static' });
  }

  actualizarEstadoEnLista(clientId:number, newState:boolean){
    this.estados[clientId] = newState;
    const clienteIndex= this.data.findIndex(client => client.idcliente === clientId);
    if(clienteIndex !== -1){
      this.data[clienteIndex].estado = newState;
    }
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }

  toggleEstado(client:any){
    const clientId= client.idcliente;
    const estadoAnterior= client.estado;

    client.estado = !estadoAnterior;
    Swal.fire({
      title: 'Confirmar Cambio de Estado',
      text: '¿Estás seguro de cambiar el estado de este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#4CAF50',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Cambia el estado del interruptor solo si el usuario hace clic en "Aceptar"
        this.cambiarEstadoCliente(clientId, !estadoAnterior);
        this.toastr.success('Estado del cliente actualizado con éxito', 'Éxito',{
          timeOut:1000
        });
        setTimeout(() => {
          this.reloadComponent();
        },1000)
      } else {
        // Si se hace clic en "Cancelar," restaura el estado del interruptor
        client.estado = estadoAnterior;
      }
    });

  }

  obtenerEstadoFormateado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  exportarExcel(): void {
    // Obtén todos los datos, ya sean activos o inactivos
    this.apiClientes.getClientes(this.token).subscribe(
      (data: any[]) => {
        // Crea un array para almacenar los datos
        const excelData: any[] = [];
  
        // Agrega el encabezado del thead (excluyendo la columna de acciones)
        const headerData = [
          '#', 'Nombre', 'Apellido', 'Telefono', 'Correo', 'Estado'
        ];
        excelData.push(headerData);
  
        // Itera sobre los datos y obtén los valores de las celdas
        data.forEach(item => {
          const rowData = [
            item.idcliente,
            item.nombre,
            item.apellido,
            item.telefono,
            item.correo,
            this.obtenerEstadoFormateado(item.estado) // Utiliza la función para obtener el estado formateado
          ];
          excelData.push(rowData);
        });
  
        // Crea una hoja de cálculo
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);
  
        // Crea un libro de trabajo
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  
        // Guarda el archivo
        XLSX.writeFile(wb, 'clientes.xlsx');
      },
      (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    );
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
