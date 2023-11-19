import { Component, ChangeDetectorRef } from '@angular/core';
import { ApiVentasService } from 'src/app/demo/service/ventas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Location } from '@angular/common';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.component.html',
  styleUrls: ['./detalle-venta.component.scss']
})
export class DetalleVentaComponent {


  constructor(
    private apiVentas: ApiVentasService,
    private bsModalRef: BsModalRef,
    private location: Location,
    private route: ActivatedRoute,
    private apiClientes: ApiClientesService
  ) {
    this.route.params.subscribe(params => {
      this.saleId = +params['id']; // El "+" convierte el valor en un número
    });
  }


  datosOriginales: any = {};
  datosModificados: any = {
    numerofactura: '',
    idcliente: '',
    fecha: '',
    metodopago: '',
    estadopago: '',
    valortotal: '',
    estado: false,
    detalleProductos: [],
    detalleServicios: []
  };

  saleId: number;
  venta: any;

  clientes: any[] = [];
  categorias: any[] = [];
  servicios: any[] = [];
  productos: any[] = [];
  searchCliente: string = '';
  selectedCategoria: any;
  selectedProducto: any;
  selectedServicio: any;
  cantidadProducto: number;
  productosAgregados: any[] = [];
  serviciosAgregados: any[] = [];
  total: number = 0;
  precioProducto: number;
  precioServicio: number;
  mostrarDetallesProductos: boolean = false;
  mostrarDetallesServicios: boolean = false;
  precioProductoFormateado: string;
  subtotal: number;
  subtotalFormateado: string;
  tipoActual: string;
  descripcionServicio: string = '';
  descripcionServicioOriginal: string = '';
  loading: boolean = false;
  camposValidos: boolean = false;
  token=localStorage.getItem('token');



  ngOnInit() {

    this.apiClientes.getClientes(this.token).subscribe((clientes) => {
      this.clientes = clientes;

      this.apiVentas.getVentasById(this.saleId,this.token).subscribe((data) => {
        console.log('Data:', data);

        if (data.venta) {
          this.datosOriginales = {
            numerofactura: data.venta.numerofactura,
            metodopago: data.venta.metodopago,
            fecha: data.venta.fecha,
            estadopago: data.venta.estadopago,
            valortotal: data.venta.valortotal,
            idcliente: data.venta.idcliente,
            detalleProductos: data.venta.DetalleVentaProductos || [],
            detalleServicios: data.venta.DetalleVentaServicios || []
          };
          console.log("Datos originales", this.datosOriginales);

          this.datosModificados.numerofactura = data.venta.numerofactura;
          this.datosModificados.metodopago = data.venta.metodopago;
          this.datosModificados.fecha = data.venta.fecha;
          this.datosModificados.valortotal = data.venta.valortotal;
          this.datosModificados.idcliente = data.venta.idcliente;
          this.datosModificados.estadopago = data.venta.estadopago;
          this.datosModificados.detalleProductos = data.venta.DetalleVentaProductos || [];
          this.datosModificados.detalleServicios = data.venta.DetalleVentaServicios || [];
          console.log("Datos modificados", this.datosModificados.detalleProductos)


          // Actualizar detalles de productos
          this.actualizarDetallesProductos();

          // Actualizar detalles de servicios
          this.actualizarDetallesServicios();

          // Resto del código...
        } else {
          console.error('No se encontraron datos de la venta con el ID proporcionado.');
        }
      })
    });
  }

  actualizarDetallesProductos() {
    this.productosAgregados = [];

    for (const detalleProducto of this.datosOriginales.detalleProductos) {
      this.productosAgregados.push({
        nombre: detalleProducto.idproducto,
        cantidad: detalleProducto.cantidadproducto,
        precio: detalleProducto.precio,
        subtotal: detalleProducto.cantidadproducto * detalleProducto.precio,
        tipo: 'Producto'
      });
    }
  }

  actualizarDetallesServicios() {
    this.serviciosAgregados = [];

    for (const detalleServicio of this.datosOriginales.detalleServicios) {
      this.serviciosAgregados.push({
        nombre: detalleServicio.descripcion,
        cantidad: 1,
        precio: detalleServicio.precio,
        subtotal: detalleServicio.precio,
        tipo: 'Servicio'
      });
    }
  }


  volverPaginaAnterior() {
    this.location.back();
  }


}
