interface Cliente {
  nombre: string;
  apellido: string;
  // Otras propiedades...
  nombreCompleto?: string;
}

import { Component, ChangeDetectorRef  } from '@angular/core';
import { ApiVentasService } from 'src/app/demo/service/ventas.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from 'src/app/shared/components/btn-loading/btn-loading.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';
import { ApiProductosService } from 'src/app/demo/service/productos.service';
import { ApiServiciosService } from 'src/app/demo/service/servicios.service';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-venta',
  templateUrl: './crear-venta.component.html',
  styleUrls: ['./crear-venta.component.scss']
})
export class CrearVentaComponent {

  constructor(
    public apiVentas: ApiVentasService, 
    private router: Router,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef,
    private apiClientes: ApiClientesService,
    private apiCategorias: ApiCategoriaService,
    private apiProductos: ApiProductosService,
    private cdRef: ChangeDetectorRef,
    private apiServicios: ApiServiciosService,
    private location: Location
    ) {}


  sale:any={
    numerofactura:this.generateFacturaNumber(),
    idcliente:'',
    fecha:new Date().toISOString().split('T')[0],
    metodopago:'',
    estadopago:'',
    tipopago:'',
    valortotal:'',
    oberservacion:'',
    detalleProductos:[],
    detalleServicios:[]
  }

  
  
  metodosPago=[
    'Efectivo',
    'Transferencia'
  ]

  tiposPago=[
    'Contado',
    'Credito'
  ]


  clientes: Cliente[] = [];
  categorias: any[] = [];
  servicios: any[] = [];
  productos: any[] = [];
  searchCliente: string = '';
  selectedCategoria:any;
  selectedProducto:any;
  selectedServicio:any;
  cantidadProducto: number;
  productosAgregados: any[] = [];
  serviciosAgregados: any[] = [];
  total: number = 0;
  precioProducto:number;
  precioServicio:number;
  mostrarDetallesProductos: boolean = false;
  mostrarDetallesServicios: boolean = false;
  precioProductoFormateado: string;  
  cantidad:number;
  subtotal:number;
  subtotalFormateado:string;
  tipoActual: string;
  descripcionServicio: string = '';
  descripcionServicioOriginal: string = '';
  loading:boolean=false;
  camposValidos:boolean=false;
  token=localStorage.getItem('token');
  
  
  errorMessages={
    cantidad:'',
    precio:''
  }


  ngOnInit(){
    this.obtenerClientes();
    this.obtenerCategorias();
    this.obtenerProductos();
    this.obtenerServicios();

  }

  setEstadoPago() {
    if (this.sale.tipopago === 'Contado') {
      this.sale.estadopago = 'Pagado';
    } else if (this.sale.tipopago === 'Credito') {
      this.sale.estadopago = 'Pendiente';
    }
  }
  
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  camposCompletos(): boolean {
    return (
      !!this.sale.tipopago &&
      !!this.sale.metodopago &&
      !!this.sale.idcliente &&
      (this.sale.detalleProductos.length > 0 || this.sale.detalleServicios.length > 0)
    );
  }

camposCpmpletos2():boolean{
  return(
    !!this.cantidadProducto &&
    !!this.selectedProducto
  )
}

camposCpmpletos3():boolean{
  return(
    !!this.selectedServicio &&
    !!this.precioServicio
  )
}

  validarCantidad(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
  
    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');
//console.log(typeof inputValue);
    // Aplica la validación de números mayores a 0
    const validacion = /^[1-9][0-9]*$/;
    if (inputValue && !validacion.test(inputValue) ||+inputValue > 50) {
        // Si no pasa la validación, puedes mostrar un mensaje de error
        this.errorMessages.cantidad = 'La cantidad solo acepta números mayores a 0 y menor igual a 50.';
        this.camposValidos=false;
    } else {
        // Si pasa la validación, elimina el mensaje de error
        this.errorMessages.cantidad = '';
        this.camposValidos=true;
        this.cantidadProductoPorId();
    }
  
    // Asigna el valor limpio nuevamente al campo de entrada
    inputElement.value = inputValue;
  
    // También actualiza la propiedad vinculada al modelo de datos

  }

  cantidadProductoPorId() {
    if (this.selectedProducto) {
      // Obtén el ID del producto seleccionado
      const idProducto = this.selectedProducto;
  
      // Llama al servicio para obtener el producto por su ID
      this.apiProductos.getProductId(idProducto,this.token).subscribe(
        (productoEncontrado) => {
          // Obtén la cantidad actual del producto
          const cantidadActual = productoEncontrado.cantidad;
  
          // Compara con la cantidad ingresada
          if (this.cantidadProducto > cantidadActual) {
            this.errorMessages.cantidad = 'La cantidad ingresada es mayor que la cantidad actual.';
            this.camposValidos=false;
          } else {
            //console.log('La cantidad ingresada es válida.');
            this.camposValidos=true;
          }
        },
        (error) => {
          console.error('Error al obtener el producto por ID:', error);
          // Manejar el error, mostrar un mensaje al usuario, etc.
        }
      );
    }
  }

  validarPrecioVenta(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
  
    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');
  
    // Remueve los separadores de miles (puntos)
    inputValue = inputValue.replace(/\./g, '');
  
    // Verifica si el campo está vacío o es igual a cero
    if (!inputValue.trim() || parseFloat(inputValue) === 0) {
      // Si el campo está vacío o es igual a cero, muestra un mensaje de error
      this.errorMessages.precio = '';
      this.camposValidos = false;
      return; // Sale de la función
    }
  
    // Convierte el valor a un número
    const numericValue = parseFloat(inputValue);
  
    // Verifica si el valor está dentro de los límites
    if (numericValue >= 1000 && numericValue <= 600000) {
      // Si el valor está dentro de los límites, no muestra ningún mensaje de error
      this.errorMessages.precio = '';
      this.camposValidos = true;
    } else {
      // Si el valor está fuera de los límites, muestra un mensaje de error
      this.errorMessages.precio = 'El precio de venta debe estar entre 1.000 y 600.000';
      this.camposValidos = false;
    }
}

  
  eliminarProducto(index: number) {
    // Elimina el producto del arreglo detalleProductos
    const productoEliminado = this.sale.detalleProductos.splice(index, 1)[0];
  
    if (productoEliminado && productoEliminado.idproducto) {
      // Encuentra el índice del producto en productosAgregados y elimínalo
      const indexProductoAgregado = this.productosAgregados.findIndex(
        (producto) => producto.idproducto === productoEliminado.idproducto
      );
  
      if (indexProductoAgregado !== -1) {
        this.productosAgregados.splice(indexProductoAgregado, 1);
      }
    }
  
    // Recalcula el total
    this.calcularTotal();
  }
  
  eliminarServicio(index: number) {
    // Elimina el servicio del arreglo detalleServicios
    const servicioEliminado = this.sale.detalleServicios.splice(index, 1)[0];
  
    if (servicioEliminado && servicioEliminado.idservicio) {
      // Encuentra el índice del servicio en serviciosAgregados y elimínalo
      const indexServicioAgregado = this.serviciosAgregados.findIndex(
        (servicio) => servicio.idservicio === servicioEliminado.idservicio
      );
  
      if (indexServicioAgregado !== -1) {
        this.serviciosAgregados.splice(indexServicioAgregado, 1);
      }
    }
  
    // Recalcula el total
    this.calcularTotal();
  }
  
  
  actualizarProductosAgregados() {
    this.productosAgregados = [];
  
    for (const detalleProducto of this.sale.detalleProductos) {
      this.productosAgregados.push({
        nombre: detalleProducto.nombre,
        cantidad: this.cantidadProducto,
        precio: detalleProducto.precio,
        subtotal: detalleProducto.precio,
        tipo: 'Servicio'
      });
    }
  }
  
  actualizarServiciosAgregados() {
    this.serviciosAgregados = [];
  
    for (const detalleServicio of this.sale.detalleServicios) {
      this.serviciosAgregados.push({
        nombre: detalleServicio.nombre,
        cantidad: 1,
        precio: detalleServicio.precio,
        subtotal: detalleServicio.precio,
        tipo: 'Servicio'
      });
    }
  }
  

  generateFacturaNumber(): number {
    // Genera un número aleatorio entre 100000 y 999999 (puedes ajustar según tus necesidades)
    const randomFacturaNumber = Math.floor(Math.random() * 900000) + 100000;
    return randomFacturaNumber;
  }

  obtenerClientes() {
    this.apiClientes.getClientesActivos(this.token).subscribe(
      (data: any[]) => {
        this.clientes = data.map(cliente => ({
          ...cliente,
          nombreCompleto: `${cliente.nombre} ${cliente.apellido}`
        }));
      },
      (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    );
  }

  obtenerCategorias() {
    this.apiCategorias.getActiveCategory(this.token).subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }

  obtenerServicios() {
    this.apiServicios.getServiciosActivos(this.token).subscribe(
      (data) => {
        this.servicios = data;
      },
      (error) => {
        console.error('Error al obtener los servicios activos:', error);
      }
    );
  }
  


  obtenerProductos() {
    this.apiProductos.getProductosActivos(this.token).subscribe(
      (data) => {
        this.productos = data;
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  get filteredClientes() {
    if (!this.searchCliente.trim()) {
      return this.clientes;
    }

    const searchTerm = this.searchCliente.toLowerCase();

    return this.clientes.filter(cliente => {
      return cliente.nombreCompleto.toLowerCase().includes(searchTerm);
    });
  }

filtrarProductosPorCategoria(idcategoria: any) {
  if (idcategoria) {
    // Llama al servicio para obtener productos por categoría
    this.apiProductos.getProducByCategoria(idcategoria,this.token).subscribe(
      (data) => {
        this.productos = data;
      },
      (error) => {
        console.error('Error al obtener los productos por categoría:', error);
      }
    );
  } else {
    // Si no se selecciona ninguna categoría, muestra todos los productos
    this.obtenerProductos();
  }
}


  agregarProducto() {
    if (!this.cantidadProducto) {
      // Si el precio del servicio no está lleno, muestra un mensaje de error
      this.errorMessages.cantidad='La cantidad del no puede estar vacia.'
      return; // No agrega el servicio y sale de la función
    }

    // Llama al servicio para obtener el producto por su ID
    this.apiProductos.getProductId(this.selectedProducto,this.token).subscribe(
      (productoEncontrado) => {
        const nombre = productoEncontrado.nombre;
        const precio = productoEncontrado.precio_venta;
        const idproducto = this.selectedProducto;

  
        const productoExistente = this.sale.detalleProductos.find(
          (detalleProducto) => detalleProducto.idproducto === idproducto
        );
  
        if (productoExistente) {
          // Si el producto ya existe, actualiza la cantidad
          productoExistente.cantidadproducto += this.cantidadProducto;
          this.cantidadProducto = productoExistente.cantidadproducto;
          this.calcularTotal();
      
          // Actualiza la cantidad en productosAgregados
          const index = this.productosAgregados.findIndex(item => item.idproducto === idproducto);
          if (index !== -1) {
            this.productosAgregados[index].cantidad = this.cantidadProducto;
            this.productosAgregados[index].subtotal = this.cantidadProducto * precio;
          }
        } else {
          // Si el producto no existe, agrégalo a la lista
          const detalleProducto = {
            idproducto: idproducto,  // Asegúrate de tener la propiedad idproducto disponible
            cantidadproducto: this.cantidadProducto,
            precio: precio
          };
          this.sale.detalleProductos.push(detalleProducto);
          this.calcularTotal();
      
          // Agrega el producto a la lista productosAgregados para mostrarlo en la tabla
          this.productosAgregados.push({
            idproducto: idproducto,  // Asegúrate de tener la propiedad idproducto disponible
            nombre: nombre,
            cantidad: this.cantidadProducto,
            precio: precio,
            subtotal: this.cantidadProducto * precio,
            tipo: 'Producto'
          });
        }
        this.calcularTotal();
  
        // Limpia los campos
        this.selectedProducto = '';
        this.cantidadProducto = null;
        this.precioProductoFormateado='';
        this.selectedCategoria='';
        this.camposValidos=false
  
        // Notifica cambios al Angular Change Detector si es necesario
        this.cdRef.detectChanges();
      },
      (error) => {
        console.error('Error al buscar el producto por ID:', error);
        // Maneja el error, muestra un mensaje al usuario, etc.
      }
    );
  }

  

  agregarServicio() {
    if (!this.precioServicio) {
      // Si el precio del servicio no está lleno, muestra un mensaje de error
      this.errorMessages.precio = 'El precio del servicio no puede estar vacío.';
      return; // No agrega el servicio y sale de la función
    }
  
    // Llama al servicio para obtener el servicio por su ID
    this.apiServicios.getServiceById(this.selectedServicio, this.token).subscribe(
      (servicioEncontrado) => {
        const idservicio = this.selectedServicio;
        const precio = this.precioServicio;
  
        // Si el servicio no existe, agrégalo a la lista
        const detalleServicio = {
          idservicio: idservicio,
          precio: precio,
        };
        this.sale.detalleServicios.push(detalleServicio);
        this.calcularTotal();
  
        // Agrega el servicio a la lista serviciosAgregados para mostrarlo en la tabla
        this.serviciosAgregados.push({
          idservicio: idservicio,
          nombre: servicioEncontrado.nombre,
          cantidad: 1,
          precio: precio,
          subtotal: precio,
          tipo: 'Servicio'
        });
  
        this.calcularTotal();
  
        this.selectedServicio = '';
        this.camposValidos=false;
        this.descripcionServicio = '';
        this.precioServicio = null;
  
        // Notifica cambios al Angular Change Detector si es necesario
        this.cdRef.detectChanges();
      },
      (error) => {
        console.error('Error al buscar el servicio por ID:', error);
        // Maneja el error, muestra un mensaje al usuario, etc.
      }
    );
  }

  agregarDetalle() {
    if (this.tipoActual === 'producto') {
      this.agregarProducto();
    } else if (this.tipoActual === 'servicio') {
      this.agregarServicio();
    }
  }

  // agregarProducto() {
  //   // Lógica para agregar el producto al arreglo de productosAgregados
  //   // ...
  //   this.productosAgregados.push({
  //     nombre: this.selectedProducto,
  //     cantidad: this.cantidadProducto,
  //     precio: this.precioProducto,
  //     subtotal: this.cantidadProducto * this.precioProducto,
  //     tipo: 'Producto'
  //   });
  // }




  formatearPrecioVenta(precio: number): string {
    // Formatea el precio de venta aquí según tus necesidades
    const formattedPrice = precio.toLocaleString('es-CO'); // Formato de pesos colombianos
    return formattedPrice;
  }
  
  eliminarDetalle(index: number) {
    this.sale.detalleProductos.splice(index, 1);
    this.calcularTotal();
  }
  

  calcularTotal() {
    const totalProductos = this.sale.detalleProductos.reduce((total, detalleProducto) => {

      return total + detalleProducto.cantidadproducto * detalleProducto.precio;
    }, 0);
  
    const totalServicios = this.sale.detalleServicios.reduce((total, detalleServicio) => {
      return total + detalleServicio.precio;
    }, 0);
  
    this.sale.valortotal = totalProductos + totalServicios;
  

  }
  
  
  obtenerDescripcionServicio() {
    if (this.selectedServicio) {
        // Obtener el producto completo por su ID
        this.apiServicios.getServiceById(this.selectedServicio,this.token).subscribe(
            (servicioEncontrado) => {
                // Actualizar la descripción en el modelo
                this.descripcionServicio = servicioEncontrado.descripcion;
            },
            (error) => {
                console.error('Error al obtener el servicio por ID:', error);
                // Manejar el error, mostrar un mensaje al usuario, etc.
            }
        );
    } else {
        // Limpiar la descripción si no se selecciona ningún servicio
        this.descripcionServicio = null;
    }
}


obtenerPrecioProducto() {
  if (this.selectedProducto) {
      // Obtener el producto completo por su ID
      this.apiProductos.getProductId(this.selectedProducto,this.token).subscribe(
          (productoEncontrado) => {
              // Actualizar el precio en el modelo
              this.precioProducto = productoEncontrado.precio_venta;
              this.precioProductoFormateado = this.formatearPrecioVenta(this.precioProducto);
              this.cantidad= productoEncontrado.cantidad;
          },
          (error) => {
              console.error('Error al obtener el producto por ID:', error);
              // Manejar el error, mostrar un mensaje al usuario, etc.
          }
      );
  } else {
      // Limpiar el precio si no se selecciona ningún producto
      this.precioProducto = null;
   
  }
}


registrarVenta() {
  Swal.fire({
    title: 'Confirmar registro',
    text: '¿Estás seguro de registrar esta venta?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, registrar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4CAF50',
  }).then((result) => {
    if (result.isConfirmed) {
      // Si el usuario confirma, procede con el registro de la venta
      this.sale.observacion = null; // o '' si prefieres que esté vacío en lugar de nulo

      this.apiVentas.createSale(this.sale, this.token).subscribe(
        (response) => {
          if (response && response.status === 'success') {
            if (response.sale) {
              this.submit();
            }
          } else {
            this.submit();
          }
        },
        (error) => {
          console.error('Error en la solicitud:', error);
        }
      );
    }
  });
}


reloadComponent() {
  const currentRoute = this.router.url;
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate([currentRoute]);  
  });
}

volverPaginaAnterior() {
  this.location.back();
}

submit() {
  if (!this.loading) {
    this.loading = true;

    // Cambia el tiempo de duración del mensaje del Toastr a 1000 ms (1 segundo)
    this.toastr.success('Venta registrada con éxito.', 'Éxito', { progressBar: true, timeOut: 2000 });
    this.volverPaginaAnterior();
    this.reloadComponent();
  }
}


}


  


