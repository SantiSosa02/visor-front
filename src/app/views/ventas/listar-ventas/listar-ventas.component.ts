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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiProductosService } from 'src/app/demo/service/productos.service';
import { ApiServiciosService } from 'src/app/demo/service/servicios.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-listar-ventas',
  templateUrl: './listar-ventas.component.html',
  styleUrls: ['./listar-ventas.component.scss']
})
export class ListarVentasComponent {

  constructor(
    private apiVentas: ApiVentasService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private apiClientes: ApiClientesService,
    private sanitizer: DomSanitizer,
    private apiProductos: ApiProductosService,
    private apiServicios: ApiServiciosService
  ) { }

  datosOriginales: any = {};
  datosModificados: any = {
    numerofactura: '',
    idcliente: '',
    fecha: '',
    metodopago: '',
    estadopago: '',
    tipopago:'',
    valortotal: '',
    estado: false,
    detalleProductos: [],
    detalleServicios: []
  };
  data: any[] = [];
  clientes: { [key: number]: string } = {};
  estados: { [key: number]: boolean } = {};
  busqueda: string = '';
  totalItems: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  noHayVentasRegsitradas: boolean = true;
  filtroActivo: boolean = true;
  modalRef: BsModalRef;
  estadoOriginal: boolean;
  token = localStorage.getItem('token');
  sumaVentasActivasUltimoMes: number = 0;
  filtroEstadoPago: string = '';
  
  

  construirTablaDetallesProductosYServicios(): Promise<string> {
    const promesas: Promise<string>[] = [];

    // Detalles de Productos
    this.datosModificados.detalleProductos.forEach((detalle) => {
      const subtotal = detalle.cantidadproducto * detalle.precio;
      const subtotalFormateado = subtotal.toLocaleString('es-CO');
      const precioFormateado = detalle.precio.toLocaleString('es-CO');
      const promesaProducto = new Promise<string>((resolve) => {
        this.apiProductos.getProductId(detalle.idproducto, this.token).subscribe((producto) => {
          const nombreProducto = producto?.nombre || 'Producto no encontrado';
          const fila = `
          <style>
          td{
            .align-right {
              text-align: right;
            }
          }
          </style>
            <tr>
              <td>${nombreProducto}</td>
              <td>${detalle.cantidadproducto}</td>
              <td>${precioFormateado}</td>
              <td>${subtotalFormateado}</td>
              <td>Producto</td>
            </tr>
          `;
          resolve(fila);
        });
      });
      promesas.push(promesaProducto);
    });

    // Detalles de Servicios
    this.datosModificados.detalleServicios.forEach((detalle) => {
      const precioFormateado = detalle.precio.toLocaleString('es-CO');
      const promesaServicio = new Promise<string>((resolve) => {
        this.apiServicios.getServiceById(detalle.idservicio, this.token).subscribe((servicio) => {
          const nombreServicio = servicio?.nombre || 'Servicio no encontrado';
          const fila = `
            <tr>
              <td>${nombreServicio}</td>
              <td>1</td>
              <td>${precioFormateado}</td>
              <td>${precioFormateado}</td>
              <td>Servicio</td>
            </tr>
          `;
          resolve(fila);
        });
      });
      promesas.push(promesaServicio);
    });

    return Promise.all(promesas).then((filas) => {
      let tablaHTML = `
      <style>
        .cuadro {
          border: 1px solid #ddd; 
          padding: 10px; 
          border-radius: 5px; 
        }

        .table {
          border-collapse: collapse; /* Cambiado a 'collapse' para eliminar los espacios entre celdas */
          width: 100%;
        }
      
        .table th, .table td {
          border: 1px solid #ddd; /* Borde para las celdas */
          padding: 10px; /* Espaciado interno en las celdas */
          text-align: left; /* Alineación del texto */
        }
      </style>
      <div class="cuadro">
        <table class="table">
          <thead>
            <tr>
              <th clas="col" >Nombre</th>
              <th clas="col" >Cantidad</th>
              <th clas="col" >Precio</th>
              <th clas="col" >Subtotal</th>
              <th clas="col" >Tipo</th>
            </tr>
          </thead>
          <tbody>
      `;

      tablaHTML += filas.join('');

      tablaHTML += `
          </tbody>
        </table>
        </div>
        </body>
      `;

      return tablaHTML;
    });
  }

  imprimirDetalleVenta(idventa: number) {
    this.apiVentas.getVentasById(idventa, this.token).subscribe((data) => {

      if (data.venta) {
        this.datosOriginales = {
          numerofactura: data.venta.numerofactura,
          metodopago: data.venta.metodopago,
          fecha: data.venta.fecha,
          estadopago: data.venta.estadopago,
          valortotal: data.venta.valortotal,
          idcliente: data.venta.idcliente,
          detalleProductos: data.venta.DetalleVentaProductos || [],
          detalleServicios: data.venta.DetalleVentaServicios || [],
        };

        this.datosModificados.numerofactura = data.venta.numerofactura;
        this.datosModificados.metodopago = data.venta.metodopago;
        this.datosModificados.fecha = data.venta.fecha;
        this.datosModificados.valortotal = data.venta.valortotal;
        this.datosModificados.idcliente = data.venta.idcliente;
        this.datosModificados.estadopago = data.venta.estadopago;
        this.datosModificados.tipopago = data.venta.tipopago;
        this.datosModificados.detalleProductos =
          data.venta.DetalleVentaProductos || [];
        this.datosModificados.detalleServicios =
          data.venta.DetalleVentaServicios || [];
        // console.log(
        //   'Datos modificados',
        //   this.datosModificados.detalleProductos
        // );

        // Obtener el cliente por su ID
        this.apiClientes.getClientById(this.datosModificados.idcliente, this.token).subscribe((cliente) => {
          const nombreCliente = cliente?.nombre + " " + cliente?.apellido || 'Cliente no encontrado';

          // Abre la ventana de impresión
          const imprimirWindow = window.open('');
          const valorTotal = this.datosModificados.valortotal;
          const valorFormateado = valorTotal.toLocaleString('es-CO');

          // Escribe el contenido que deseas imprimir
          imprimirWindow.document.write('<html><head><title>Detalle de Venta</title></head><body>');

          // Construye la cadena HTML con los detalles de la venta
          this.construirTablaDetallesProductosYServicios().then((tablaHTML) => {
            const contenidoHTML: string = `
            <style>
            h2 {
              margin-top: 20px;
              text-align: center;
            }
          
            h3 {
              margin-top: 40px;
            }
          
            .valor-total {
              font-weight: bold;
            }
          
            .contenedor {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              margin-top: 60px;
              border: 2px solid #000;
              padding: 20px;
              width: 65%;
            }
          
            .container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 10px;
            }
          
            label {
              font-weight: bold;
            }
          
            .etiqueta {
              display: flex;
              flex-direction: column;
              align-items: flex-end; /* Alinea a la derecha */
              margin-right: 10px; /* Espacio entre label y p */
            }
          
            img {
              width: 15%;
              height: 15%;
              border-radius: 50%;
              border: 2px solid #000;
            }

          
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }

            .contenedor-valores{
              displya:flex;
              align-items: space-around;
              width:80%;
            }

            .container1{
              display: flex;
              align-items:flex-end ;
              width:80%;
            }

            .valor{
              margin-left: 10px;
            }
          </style>
          
          <body>
            <div class="contenedor">
           
                <img src="assets/layout/images/VISOR1.png" alt="logo">
          
              <h2>Recibo de Venta</h2>
              <div class="contenedor-valores">
              <div class="container">
                <label>Número de Factura:</label>
                <div class="etiqueta">
                  <p>${this.datosModificados.numerofactura}</p>
                </div>
              </div>
              <div class="container">
                <label>Método de pago:</label>
                <div class="etiqueta">
                  <p>${this.datosModificados.metodopago}</p>
                </div>
              </div>
              <div class="container">
                <label>Fecha:</label>
                <div class="etiqueta">
                  <p>${this.datosModificados.fecha}</p>
                </div>
              </div>
              <div class="container">
                <label>Tipo de pago:</label>
                <div class="etiqueta">
                  <p>${this.datosModificados.tipopago}</p>
                </div>
              </div>
              <div class="container">
                <label>Cliente:</label>
                <div class="etiqueta">
                  <p>${nombreCliente}</p>
                </div>
              </div>
              </div>
  
                <h3>Detalles de Productos y Servicios</h3>
                ${tablaHTML} 

                <div class="container1" style="display: flex; align-items: baseline;">
                  <label class="espaciado">Valor Total:</label>
                  <p class="valor">${valorFormateado}</p>
              </div>
              </div>
            `;

            // Convierte la cadena segura a una cadena regular
            const contenidoComoString: string = contenidoHTML.toString();

            // Escribe el contenido HTML en la ventana de impresión
            imprimirWindow.document.write(contenidoComoString);

            // Cierra el documento y realiza la impresión
            imprimirWindow.document.write('</body></html>');
            imprimirWindow.document.close();
            this.reloadComponent();
            imprimirWindow.print();
          });
        });
      }
    });
  }

  ngOnInit() {
    this.cargarVentas(true);
    this.obtenerSumaVentasActivasUltimoMes();
  }

  cambiarEstadoVenta(saleId: number, newState: boolean) {
    this.apiVentas.updateSaleState(saleId, newState, this.token).subscribe(
      (response) => {
        if (response && response.message === 'Estado de la venta actualizado exitosamente.') {
          this.actualizarEstadoEnLista(saleId, newState);
        } else {

        }
      },
      (error) => {
      }
    )
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute])
    })
  }

  toggleEstado(sale: any) {
    const saleId = sale.idventa;
    const estadoAnterior = sale.estado;
  
    sale.estado = !estadoAnterior;
  
    this.apiVentas.getAbonosRelacionados(saleId, this.token).subscribe(
      (response: any) => {
        const cantidadAbonos = response.length;
  
        if (cantidadAbonos > 0) {
          Swal.fire({
            title: 'Alerta',
            text: 'Esta venta tiene saldos pendientes.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then((result) => {
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
            allowOutsideClick: false,
            allowEscapeKey: false,
            input: 'textarea', // Cambiado a 'textarea'
            inputLabel: 'Observación',
            inputPlaceholder: 'Ingresa la observación aquí',
            inputAttributes: {
              // Establece la propiedad resize a none para evitar que el textarea sea redimensionable
              style: 'resize: none;'
            },
            inputValidator: (value) => {
              if (!value) {
                  return 'Por favor ingresa una observación';
              }
              const pattern = /^[a-zA-Z0-9\s]*$/;
              if (!pattern.test(value)) {
                  return 'La observación solo puede contener letras y números';
              }
              return null;
          }
          
          }).then((result) => {
            if (result.isConfirmed) {
              const observacion = result.value;
              // Realiza la solicitud PUT para modificar la observación
              this.apiVentas.createObservacion(saleId, observacion, this.token).subscribe(
                () => {
                  // Si la observación se guarda correctamente, cambia el estado de la venta
                  this.cambiarEstadoVenta(saleId, !estadoAnterior);
                  this.toastr.success('Estado de la venta actualizada con éxito', 'Éxito', {
                    timeOut: 2000
                  });
                  setTimeout(() => {
                    this.reloadComponent();
                  }, 2000);
                },
                (error) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'Hubo un problema al guardar la observación.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33',
                  });
                }
              );
            } else {
              // Si se cancela, restaura el estado de la venta
              sale.estado = estadoAnterior;
            }
          });
          
        }
      },
      (error) => {
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
    this.apiVentas.getAbonosRelacionados(saleId).subscribe(
      (abonos) => {



        if (abonos) {
          Swal.fire({
            title: 'Alerta',
            text: 'La venta tiene abonos relacionados.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false
          });
        }
      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al obtener los abonos.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
          allowOutsideClick: false,
          allowEscapeKey: false
        });
      }
    );
  }

  mostrarMensaje(sale: any) {
    const saleId = sale.idventa;

    const estadoAnterior = sale.estado;

    sale.estado = !estadoAnterior;

    Swal.fire({
      title: 'Venta Inactiva',
      text: 'Esta venta está actualmente anulada y no se puede activar.',
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

  actualizarEstadoEnLista(saleId: number, newState: boolean) {
    this.estados[saleId] = newState;
    const ventaIndex = this.data.findIndex(sale => sale.idventa === saleId);
    if (ventaIndex !== -1) {
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

  abrirDetalle(idventa: number) {
    this.router.navigate(['ventas/detalle-venta', idventa])
  }


  abrirModalAbonos(idventa: number) {
    const initialState = { ventaId: idventa };
    this.modalService.show(ListarCrearAbonosModalComponent, {
      initialState,
      backdrop: 'static',
      keyboard:false
    });
  }

  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
          // Ordenar las ventas por fecha de forma descendente
          data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayVentasRegsitradas = data.length === 0;
          this.cargarVentasConNombresClientes(); // Cambiado a esta función
        },
        (error) => {
          this.noHayVentasRegsitradas = true;
          this.toastr.warning('No hay ventas activas', 'Advertencia');
        }
      );
    } else {
      this.apiVentas.getVentasInactivos(this.token).subscribe(
        (data: any[]) => {
          // Ordenar las ventas por fecha de forma descendente
          data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayVentasRegsitradas = data.length === 0;
          this.cargarVentasConNombresClientes(); // Cambiado a esta función
        },
        (error) => {
          this.noHayVentasRegsitradas = true;
          this.toastr.warning('No hay ventas anuladas', 'Advertencia');
        }
      );
    }
  }
  
  mostrarObservacion(idVenta: number) {
    // Realiza una llamada al backend para obtener la observación de la venta con el ID proporcionado
    this.apiVentas.getObservacionId(idVenta, this.token).subscribe(
      (response: any) => {
        // Verifica si se obtuvo la observación correctamente
        if (response && response.observacion) {
          // Muestra la observación en un SweetAlert con un textarea
          Swal.fire({
            title: 'Motivo de anulación',
            html: `<textarea 
            disabled 
            style="width: 100%; 
            height: 100px; 
            resize: none; 
            padding:10px; 
            color: #999;">${response.observacion}</textarea>`,
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#4CAF50',
          });
        } else {
          // Muestra un mensaje si no se encontró la observación
          Swal.fire({
            title: 'Observación no encontrada',
            text: `No se encontró ninguna observación para la venta (${idVenta}).`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      (error) => {
        // Maneja el error si ocurre algún problema al obtener la observación
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al obtener la observación de la venta.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
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
    // Obtiene la fecha actual en formato UTC
    const fechaActual = new Date();
    
    // Calcula la fecha de inicio hace 30 días
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaActual.getDate() - 30);
    
    // Llama a la API para obtener las ventas activas
    this.apiVentas.getVentasActivos(this.token).subscribe(
        (ventas: any[]) => {
            // Filtra las ventas dentro del período de los últimos 30 días
            const ventasUltimos30Dias = ventas.filter(venta => {
              // Convierte la fecha de la venta a objeto Date
              const fechaVenta = new Date(venta.fecha);
              return fechaVenta >= fechaInicio && fechaVenta <= fechaActual;
          });
          
            // Suma las ventas del período de los últimos 30 días
            this.sumaVentasActivasUltimoMes = ventasUltimos30Dias.reduce((total, venta) => total + venta.valortotal, 0);
        },
        (error) => {
            // Manejo de errores
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
          ['Ventas', '', '', '', '', '', ''], // Esto crea una fila con siete celdas vacías que preceden al encabezado 'Ventas'
          ['Factura', 'Cliente', 'Fecha', 'Tipo Pago', 'Metodo pago', 'Valor total', 'Estado pago', 'Estado']
          // Agrega más campos según la estructura de tus datos
        ];
        excelData.push(...headerData);
  
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
                    item.tipopago,
                    item.metodopago,
                    this.formatNumber( item.valortotal),
                    item.estadopago,
                    item.estado ? 'Activo' : 'Inactivo',
                    // Puedes eliminar 'item.idcliente' aquí ya que ahora estás usando el nombre del cliente
                    // Agrega más campos según la estructura de tus datos
                  ];
                  excelData.push(rowData);
                }
                resolve();
              },
              (error) => {
                reject();
              }
            );
          });
        });
  
        Promise.all(promesasClientes).then(() => {
          // Crea una hoja de cálculo
          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);
  
          // Fusiona las celdas para el título "Ventas"
          const range = XLSX.utils.decode_range('A1:G1'); // Rango de celdas para fusionar
          ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }]; // Fusiona las celdas
  
          // Ajusta el ancho de las columnas
          const wscols = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
          ws['!cols'] = wscols;
  
          // Alinea el contenido del encabezado a la izquierda
          ws['!align'] = 'left';
  
          // Alinea el título "Ventas" al centro
          const titleCell = XLSX.utils.encode_cell({ r: range.s.r, c: range.s.c }); // Celda de título
          ws[titleCell].s = { alignment: { horizontal: 'center' } }; // Establece la alineación horizontal al centro
  
          // Alinea el encabezado de las columnas al centro
          const rangeHeader = XLSX.utils.decode_range('A2:G2'); // Rango de celdas para el encabezado
          for (let i = rangeHeader.s.c; i <= rangeHeader.e.c; i++) {
            const headerCell = XLSX.utils.encode_cell({ r: rangeHeader.s.r, c: i });
            ws[headerCell].s = { alignment: { horizontal: 'center' } }; // Establece la alineación horizontal al centro
          }
  
          // Crea un libro de trabajo
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
  
          // Guarda el archivo
          XLSX.writeFile(wb, 'ventas.xlsx');
        });
      },
      (error) => {
        this.toastr.error('Error al exportar las ventas a Excel', 'Error');
      }
    );
  }
  
  
}
