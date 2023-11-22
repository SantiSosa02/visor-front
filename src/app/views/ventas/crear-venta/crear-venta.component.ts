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
    valortotal:'',
    detalleProductos:[],
    detalleServicios:[]
  }
  
  metodosPago=[
    'Efectivo',
    'Transferencia'
  ]

  estadosPago=[
    'Pagado',
    'Por pagos'
  ]

  clientes: any[] = [];
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

  camposCompletos(): boolean {
    return (
      !!this.sale.estadopago &&
      !!this.sale.metodopago &&
      !!this.sale.idcliente &&
      (this.sale.detalleProductos.length > 0 || this.sale.detalleServicios.length > 0)
    );
  }

  validarCantidad(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
  
    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');
    console.log(typeof inputValue);
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
            console.warn('La cantidad ingresada es mayor que la cantidad actual del producto.');
            this.errorMessages.cantidad = 'La cantidad ingresada es mayor que la cantidad actual.';
            this.camposValidos=false;
          } else {
            console.log('La cantidad ingresada es válida.');
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
    console.log(typeof inputValue);
    // Verifica si el campo está vacío y elimina el mensaje de error
    if (inputValue.trim() === '') {
      this.errorMessages.precio = '';
      this.camposValidos=false;
    } else {
      // Convierte el valor a un número
      const numericValue = parseInt(inputValue.replace(/[^\d.-]/g, ''), 10);
  
      if (!isNaN(numericValue) && numericValue >= 1000 && numericValue <= 500000) {
        // Si el valor es numérico y cumple con los límites, no muestra ningún formato
        this.errorMessages.precio = '';
        this.camposValidos=true;
      } else {
        this.errorMessages.precio = 'El precio de venta debe ser un número válido  (mayor o igual a 1.000 y menor que 500.000).';
        this.camposValidos=false;
      }
    }
  
    // Asigna el valor limpio nuevamente al campo de entrada
    inputElement.value = inputValue;
  
    // También actualiza la propiedad vinculada al modelo de datos

  }
  
  eliminarProducto(index: number) {
    this.sale.detalleProductos = this.sale.detalleProductos.filter((_, i) => i !== index);
    this.actualizarProductosAgregados();
    this.calcularTotal();
  }
  
  eliminarServicio(index: number) {
    this.sale.detalleServicios = this.sale.detalleServicios.filter((_, i) => i !== index);
    this.actualizarServiciosAgregados();
    this.calcularTotal();
  }
  
  
  actualizarProductosAgregados() {
    this.productosAgregados = [];
  
    for (const detalleProducto of this.sale.detalleProductos) {
      this.productosAgregados.push({
        ...detalleProducto, // Utiliza todas las propiedades del detalleProducto
        tipo: 'Producto'
      });
    }
  }
  
  
  actualizarServiciosAgregados() {
    this.serviciosAgregados = [];
  
    for (const detalleServicio of this.sale.detalleServicios) {
      this.serviciosAgregados.push({
        nombre: detalleServicio.descripcion,
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

  obtenerClientes(){
    this.apiClientes.getClientes(this.token).subscribe(
      (data) => {
        this.clientes = data;
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
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
    console.log('Obteniendo servicios activos...');
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
        console.log('Productos:', this.productos); // Imprime los productos en la consola
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  get filteredClientes() {
    if (this.searchCliente.trim() === '') {
        return this.clientes;
    }
    const searchTerm = this.searchCliente.toLowerCase();

    return this.clientes.filter(cliente => {
        const fullName = cliente.nombre + ' ' + cliente.apellido;
        return fullName.toLowerCase().includes(searchTerm);
    });
  }

filtrarProductosPorCategoria(idcategoria: any) {
  if (idcategoria) {
    // Llama al servicio para obtener productos por categoría
    this.apiProductos.getProducByCategoria(idcategoria,this.token).subscribe(
      (data) => {
        this.productos = data;
        console.log('Productos filtrados por categoría:', this.productos);
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
        console.log('Producto encontrado:', productoEncontrado);
        const nombre = productoEncontrado.nombre;
        const precio = productoEncontrado.precio_venta;
        const idproducto = this.selectedProducto;

  
        const productoExistente = this.sale.detalleProductos.find(
          (detalleProducto) => detalleProducto.idproducto === idproducto
        );
        console.log('Producto existente:', productoExistente);
  
        if (productoExistente) {
          // Si el producto ya existe, actualiza la cantidad
          productoExistente.cantidadproducto += this.cantidadProducto;
          this.cantidadProducto = productoExistente.cantidadproducto;
          this.calcularTotal();
        
          // Actualiza la cantidad en productosAgregados
          const index = this.productosAgregados.findIndex(item => item.nombre === nombre);
          if (index !== -1) {
            this.productosAgregados[index].cantidad = this.cantidadProducto;
            this.productosAgregados[index].subtotal = this.cantidadProducto * precio;
          }
        }else {
          // Si el producto no existe, agrégalo a la lista
          const detalleProducto = {
            idproducto: idproducto,
            cantidadproducto: this.cantidadProducto,
            precio: precio
          };
          console.log("oeee", this.cantidadProducto)
          this.sale.detalleProductos.push(detalleProducto);
          this.calcularTotal();
  
          // Agrega el producto a la lista productosAgregados para mostrarlo en la tabla
          this.productosAgregados.push({
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
  
        // Notifica cambios al Angular Change Detector si es necesario
        this.cdRef.detectChanges();
        console.log('Producto agregado exitosamente');
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
      this.errorMessages.precio='El precio del servicio no puede estar vacio.'
      return; // No agrega el servicio y sale de la función
    }
    // Llama al servicio para obtener el servicio por su ID
    this.apiServicios.getServiceById(this.selectedServicio,this.token).subscribe(
      (servicioEncontrado) => {
        console.log('Servicio encontrado:', servicioEncontrado);
        const idservicio = this.selectedServicio;
        const precio = this.precioServicio; // Asegúrate de tener el campo precio en tu objeto de servicio
        const descripcion = servicioEncontrado.descripcion; // Asegúrate de tener el campo descripcion en tu objeto de servicio
  
          // Si el servicio no existe, agrégalo a la lista
          const detalleServicio = {
            idservicio: idservicio,
            precio: precio,
            descripcion: descripcion
          };
          this.sale.detalleServicios.push(detalleServicio);
          this.calcularTotal();
  
          // Agrega el servicio a la lista serviciosAgregados para mostrarlo en la tabla
          this.serviciosAgregados.push({
            nombre: servicioEncontrado.nombre, // Asegúrate de tener el campo nombre en tu objeto de servicio
            cantidad: 1, // Otra vez, ajusta según tus necesidades
            precio: precio,
            subtotal: precio,
            tipo: 'Servicio'
          });

          this.calcularTotal();
  
          this.selectedServicio='';
          this.descripcionServicio='';
          this.precioServicio = null;
         
        // Notifica cambios al Angular Change Detector si es necesario
        this.cdRef.detectChanges();
        console.log('Servicio agregado exitosamente');
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
    console.log('Detalle de productos:', this.sale.detalleProductos);
    console.log('Detalle de servicios:', this.sale.detalleServicios);
  
    const totalProductos = this.sale.detalleProductos.reduce((total, detalleProducto) => {
      console.log('Cantidad producto:', detalleProducto.cantidadproducto);
      console.log('Precio producto:', detalleProducto.precio);
      return total + detalleProducto.cantidadproducto * detalleProducto.precio;
    }, 0);
  
    const totalServicios = this.sale.detalleServicios.reduce((total, detalleServicio) => {
      console.log('Precio servicio:', detalleServicio.precio);
      return total + detalleServicio.precio;
    }, 0);
  
    this.sale.valortotal = totalProductos + totalServicios;
  
    console.log('Total de productos:', totalProductos);
    console.log('Total de servicios:', totalServicios);
    console.log('Valor total:', this.sale.valortotal);
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
  console.log('Haciendo clic en el botón de Registrar');
 
  this.apiVentas.createSale(this.sale,this.token).subscribe(
    (response) => {
      console.log('Respuesta del servidor:', response);
      if (response && response.status === 'success') {
        console.log('Registro exitoso');
        if (response.sale) {
          console.log('Datos del producto:', response.sale); // Actualiza el mensaje aquí
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


  


