import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { ApiVentasService } from 'src/app/demo/service/ventas.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { onErrorResumeNext } from 'rxjs/operators';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import { ListarCrearAbonosModalComponent } from '../../abonos/listar-crear-abonos-modal/listar-crear-abonos-modal.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-listar-ventas',
  templateUrl: './listar-ventas.component.html',
  styleUrls: ['./listar-ventas.component.scss']
})
export class ListarVentasComponent {

  constructor(
    private apiVentas: ApiVentasService,
    private router:Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private apiClientes: ApiClientesService
  ){}
  
  data:any[]=[];
  clientes:{[key: number]: string} = {};
  estados : {[ key:number]:boolean} = {};
  busqueda: string='';
  datosOriginales:any[]=[];
  totalItems:number=1;
  currentPage:number=1;
  itemsPerPage:number=6;
  noHayVentasRegsitradas:boolean=true;
  filtroActivo: boolean = true;
  modalRef: BsModalRef;
  estadoOriginal: boolean;
  token=localStorage.getItem('token');
  sumaVentasActivasUltimoMes: number = 0;
  filtroEstadoPago: string = ''; 

  ngOnInit(){
    this.cargarVentas(true);
    this.obtenerSumaVentasActivasUltimoMes();
  }

  cambiarEstadoVenta( saleId: number, newState:boolean){
    this.apiVentas.updateSaleState(saleId, newState, this.token).subscribe(
      (response) => {
        if(response && response.message === 'Estado de la venta actualizado exitosamente.'){
          this.actualizarEstadoEnLista(saleId, newState);
        }else{
         
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error)
      }
    )
  }

  reloadComponent(){
    const currentRoute=this.router.url;
    this.router.navigateByUrl('/',{ skipLocationChange:true }).then(() => {
      this.router.navigate([currentRoute])
    })
  }

  toggleEstado(sale: any) {
    const saleId = sale.idventa;
    const estadoAnterior = sale.estado;
  
    sale.estado = !estadoAnterior;
  
    this.apiVentas.getAbonosRelacionados(saleId, this.token).subscribe(
      (response: any) => {
        console.log('Respuesta del servicio:', response);
  
        // Obtén la cantidad de abonos desde la respuesta
        const cantidadAbonos = response.length;
  
        // Agrega este console.log para verificar la cantidad de abonos
        console.log('Cantidad de abonos:', cantidadAbonos);
  
        if (cantidadAbonos > 0) {
          Swal.fire({
            title: 'Alerta',
            text: 'La venta tiene abonos relacionados.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          })
          .then((result) => {
            if (result.isConfirmed) {
              sale.estado = estadoAnterior;        
            }
          });
        } else {
          Swal.fire({
            title: 'Confirmar Cambio de Estado',
            text: '¿Estás seguro de cambiar el estado de esta venta?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#4CAF50',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              // Cambia el estado del interruptor solo si el usuario hace clic en "Aceptar"
              this.cambiarEstadoVenta(saleId, !estadoAnterior);
              this.toastr.success('Estado de la venta actualizada con éxito', 'Éxito', {
                timeOut: 1000
              });
              setTimeout(() => {
                this.reloadComponent();
              }, 1000);
            } else {
              // Si se hace clic en "Cancelar," restaura el estado del interruptor
              sale.estado = estadoAnterior;
            }
          });
        }
      },
      (error) => {
        console.error('Error al obtener abonos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al obtener los abonos.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
    );
  }
  
  
  

  abonoRelacionados(sale: any) {
    const saleId = sale.idventa;
    console.log(saleId)
    this.apiVentas.getAbonosRelacionados(saleId).subscribe(
      (abonos) => {
        console.log('Respuesta del servicio:', abonos); // Agrega este console.log

        
  
        if (abonos) {
          Swal.fire({
            title: 'Alerta',
            text: 'La venta tiene abonos relacionados.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
        }
      },
      (error) => {
        console.error('Error al obtener abonos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al obtener los abonos.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
    );
  }
  
  mostrarMensaje(sale:any){
    const saleId=sale.idventa;

    const estadoAnterior=sale.estado;

    sale.estado= !estadoAnterior;

    Swal.fire({
      title: 'Venta Inactiva',
      text: 'Esta venta está actualmente inactiva y no se puede activar.',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#4CAF50'
    }).then((result) => {
      if (result.isConfirmed) {
          sale.estado = false;
          // Llama a la función para actualizar la posición del switch en la lista
          this.actualizarEstadoEnLista(sale, false);
      } else {
        // Si se hace clic en "Cancelar," restaura el estado del interruptor
        sale.estado = estadoAnterior;
      }
    });
  }

  actualizarEstadoEnLista(saleId:number, newState:boolean){
    this.estados[saleId] = newState;
    const ventaIndex = this.data.findIndex( sale => sale.idventa === saleId);
    if(ventaIndex !== -1){
      this.data[ventaIndex].estado = newState;
    }
  }

  actualizarTabla(): void {
    const busquedaMinuscula = this.busqueda.toLowerCase();
    const ventasFiltradas = this.datosOriginales.filter(item => {
      return (
        item.idcliente.toString().toLowerCase().includes(busquedaMinuscula)  // Filtrar por idcliente
      );
    });
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.data = ventasFiltradas.slice(startIndex, endIndex);
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

  abrirRegistroVenta() {
    this.router.navigate(['ventas/crear'])
 }

 abrirDetalle(idventa:number) {
  this.router.navigate(['ventas/detalle-venta',idventa])
}


 abrirModalAbonos(idventa: number) {
  const initialState = { ventaId: idventa };
  this.modalService.show(ListarCrearAbonosModalComponent, { initialState,
  backdrop:'static' });
}



 cambiarFiltro(activos: boolean) {
  this.filtroActivo = activos;
  this.currentPage = 1; // Actualiza la página a 1 al cambiar el filtro
  this.cargarVentas(activos);
}

cargarVentas(activos: boolean) {
  if (activos) {
    this.apiVentas.getVentasActivos(this.token).subscribe(
      (data: any[]) => {
        this.totalItems = data.length;
        this.datosOriginales = [...data];
        this.actualizarTabla();
        this.noHayVentasRegsitradas = data.length === 0;
        this.cargarVentasConNombresClientes(); // Cambiado a esta función
      },
      (error) => {
        this.noHayVentasRegsitradas = true;
        console.error('Error al obtener ventas activas: ', error);
      }
    );
  } else {
    this.apiVentas.getVentasInactivos(this.token).subscribe(
      (data: any[]) => {
        this.totalItems = data.length;
        this.datosOriginales = [...data];
        this.actualizarTabla();
        this.noHayVentasRegsitradas = data.length === 0;
        this.cargarVentasConNombresClientes(); // Cambiado a esta función
      },
      (error) => {
        this.noHayVentasRegsitradas = true;
        console.error('Error al obtener ventas inactivas: ', error);
      }
    );
  }
}

formatearPrecioVenta(precio: number): string {
  // Formatea el precio de venta aquí según tus necesidades
  const formattedPrice = precio.toLocaleString('es-CO'); // Formato de pesos colombianos
  return formattedPrice;
}

cargarVentasConNombresClientes() {
  const promesasClientes = this.datosOriginales.map((venta) => {
    return new Promise<void>((resolve, reject) => {
      this.apiClientes.getClientById(venta.idcliente, this.token).subscribe(
        (cliente: any) => {
          if (cliente) {
            venta.idcliente = cliente.nombre + " " + cliente.apellido;
          }
          resolve();
        },
        (error) => {
          console.error('Error al obtener el nombre del cliente:', error);
          reject();
        }
      );
    });
  });

  Promise.all(promesasClientes).then(() => {
    this.actualizarTabla();
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

  
get totalPages(): number {
  return Math.ceil(this.totalItems / this.itemsPerPage);
}

obtenerSumaVentasActivasUltimoMes() {
  const fechaFin = new Date();
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - 1);
  console.log(fechaInicio)
  console.log(fechaFin)

  this.apiVentas.getVentasActivos(this.token).subscribe(
    (ventas: any[]) => {
      const ventasUltimoMes = ventas.filter(venta =>
        new Date(venta.fecha) >= fechaInicio && new Date(venta.fecha) <= fechaFin
      );

      this.sumaVentasActivasUltimoMes = ventasUltimoMes.reduce((total, venta) => total + venta.valortotal, 0);
    },
    (error) => {
      console.error('Error al obtener las ventas activas:', error);
    }
  );
}

exportarVentasExcel(): void {
  // Obtén todos los datos de ventas, ya sean activas o inactivas
  this.apiVentas.getVentas(this.token).subscribe(
    (data: any[]) => {
      // Crea un array para almacenar los datos
      const excelData: any[] = [];

      // Agrega el encabezado del thead
      const headerData = [
        'N Factura', 'Cliente', 'Fecha', 'M Pago', 'V total', 'Estado pago', 'Estado', 'ID Venta'
        // Agrega más campos según la estructura de tus datos
      ];
      excelData.push(headerData);

      // Itera sobre los datos y obtén los valores de las celdas
      const promesasClientes = data.map((item) => {
        return new Promise<void>((resolve, reject) => {
          this.apiClientes.getClientById(item.idcliente, this.token).subscribe(
            (cliente: any) => {
              if (cliente) {
                const nombreCliente = cliente.nombre + " " + cliente.apellido;
                const rowData = [
                  item.numerofactura,
                  nombreCliente,
                  item.fecha,
                  item.metodopago,
                  item.valortotal,
                  item.estadopago,
                  item.estado ? 'Activo' : 'Inactivo',
                  item.idventa,
                  // Puedes eliminar 'item.idcliente' aquí ya que ahora estás usando el nombre del cliente
                  // Agrega más campos según la estructura de tus datos
                ];
                excelData.push(rowData);
              }
              resolve();
            },
            (error) => {
              console.error('Error al obtener el nombre del cliente:', error);
              reject();
            }
          );
        });
      });

      Promise.all(promesasClientes).then(() => {
        // Crea una hoja de cálculo
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

        // Crea un libro de trabajo
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

        // Guarda el archivo
        XLSX.writeFile(wb, 'ventas.xlsx');
      });
    },
    (error) => {
      console.error('Error al obtener las ventas:', error);
      this.toastr.error('Error al exportar las ventas a Excel', 'Error');
    }
  );
}




}
