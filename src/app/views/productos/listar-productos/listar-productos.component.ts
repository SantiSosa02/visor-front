import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { ApiProductosService } from '../../../demo/service/productos.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CrearProductosModalComponent } from '../crear-productos-modal/crear-productos-modal.component';
import { formatNumber } from '@angular/common';
import { EditarProductosModalComponent } from '../editar-productos-modal/editar-productos-modal.component';
import { AgregarCantidadModalComponent } from '../agregar-cantidad-modal/agregar-cantidad-modal.component';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';
import { DetalleProductoComponent } from '../detalle-producto/detalle-producto.component';

@Component({
  selector: 'app-listar-productos',
  templateUrl: './listar-productos.component.html',
  styleUrls: ['./listar-productos.component.scss']
})
export class ListarProductosComponent {

  data: any[] = [];
  categorias: { [key: number]: string } = {};
  estados: { [key: number]: boolean } = {}; // Objeto para mantener los estados de los usuarios
  isConfirmationDialogVisible: boolean = false;

  constructor(
    private apiProducto: ApiProductosService, 
    private router:Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private apiCategorias: ApiCategoriaService
    ) 
     {
      
  }

  busqueda: string = '';
  datosOriginales: any[] = [];
  token = localStorage.getItem('token');


  totalItems: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  noHayProductosRegistrados: boolean = true;
  filtroActivo: boolean = true; 
  modalRef: BsModalRef;

  
  

  ngOnInit(): void {
    this.cargarProductos(true); // Cargar usuarios activos al iniciar el componente
  }

  // llenarData() {
  //   this.apiProducto.getProductos().subscribe(
  //     (data) => {
  //       this.totalItems = data.length;
  //       this.datosOriginales = [...data];
  //       this.data = data.map((producto) => ({
  //         ...producto,
  //         categoria: this.categorias[producto.idcategoria] 
  //               }));
  //       this.actualizarTabla();
  //       this.noHayUsuariosRegistrados = data.length === 0;
  //     },
  //     (error) => {
  //       // Manejo de errores
  //     }
  //   );
  // }

  cambiarEstadoProductoId(productId: number, newState: boolean) {
    
    this.apiProducto.updateProductState(productId, newState, this.token).subscribe(
      (response) => {
        if (response && response.message === 'Estado del producto actualizado exitosamente.') {
          this.actualizarEstadoEnLista(productId, newState);
        } else {
          console.error('Error al cambiar el estado del producto:', response);
        }
      },
      (error) => {
        console.log('Error en la solicitud:', error);
      }
    );
  }

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }
  
  
  toggleEstado(product: any) {
    const productId = product.idproducto;
    
    // Guarda el estado actual del interruptor
    const estadoAnterior = product.estado;
  
    // Deshabilita el interruptor temporalmente
    product.estado = !estadoAnterior;
    
    // Abre un SweetAlert de confirmación
    Swal.fire({
      title: 'Confirmar Cambio de Estado',
      text: '¿Estás seguro de cambiar el estado de este producto?',
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
        this.cambiarEstadoProductoId(productId, !estadoAnterior);
        this.toastr.success('Estado del producto actualizado con éxito', 'Éxito',{
          timeOut:1000
        });
        setTimeout(() => {
          this.reloadComponent();
        },1000)
      } else {
        // Si se hace clic en "Cancelar," restaura el estado del interruptor
        product.estado = estadoAnterior;
      }
    });
  }



  actualizarEstadoEnLista(productId: number, newState: boolean) {
    this.estados[productId] = newState;
    const productoIndex = this.data.findIndex(product => product.idproducto === productId);
    if (productoIndex !== -1) {
      this.data[productoIndex].estado = newState;
    }
  }

actualizarTabla(): void {

  const busquedaMinuscula = this.busqueda.toLowerCase();
  // Filtrar todos los usuarios, tanto activos como inactivos
  const productosFiltrados = this.datosOriginales.filter(item => {
    return (
      item.nombre.toLowerCase().includes(busquedaMinuscula) ||
      item.idcategoria.toLowerCase().includes(busquedaMinuscula)
    );
  });

  // Aplicar paginación a los usuarios filtrados
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.data = productosFiltrados.slice(startIndex, endIndex);
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
  
  // abrirCrearCategoriaModal() {
  //   this.modalRef = this.modalService.show(CrearCategoriasModalComponent);
  // }

  abrirCrearProductoModal() {
   this.bsModalRef= this.modalService.show(CrearProductosModalComponent,{
    backdrop:'static',
    keyboard:false
    });
  }


  abrirModalDeEdicion(idproducto: number) {
    const initialState = { productId: idproducto };
    this.modalService.show(EditarProductosModalComponent, { initialState,
    backdrop:'static',
    keyboard:false
    });
  }

  abrirModalDetalle(idproducto: number) {
    const initialState = { productId: idproducto };
    this.modalService.show(DetalleProductoComponent, { initialState, 
      backdrop:'static' });
  }
  
  abrirModalCantidad(idproducto: number) {
    const initialState = { productId: idproducto };
    this.modalService.show(AgregarCantidadModalComponent, { initialState,
    backdrop: 'static',
    keyboard:false
   }); 
  }

  cambiarFiltro(activos: boolean) {
    this.filtroActivo = activos;
    this.currentPage = 1; // Actualiza la página a 1 al cambiar el filtro
    this.cargarProductos(activos);
  }

  cargarProductos(activos: boolean) {
  
    if (activos) {
      this.apiProducto.getProductosActivos(this.token).subscribe(
        (data: any[]) => {
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayProductosRegistrados = data.length === 0;
          this.cargarProductosConNombreCategoria();
        },
        (error) => {
          this.noHayProductosRegistrados = true;
          // console.error('Error al obtener productos activos:', error);
          this.toastr.warning('No hay productos activos', 'Advertencia');
        }
      );
    } else {
    
      this.apiProducto.getProductosInactivos(this.token).subscribe(
        (data: any[]) => {
          this.totalItems = data.length;
          this.datosOriginales = [...data];
          this.actualizarTabla();
          this.noHayProductosRegistrados = data.length === 0;
          this.cargarProductosConNombreCategoria();
        },
        (error) => {
          this.noHayProductosRegistrados = true;
          // console.error('Error al obtener categorías inactivas:', error);
          this.toastr.warning('No hay productos inactivos', 'Advertencia');        }
      );
    }
  }

  

  cargarProductosConNombreCategoria() {

    const promesasCategorias = this.datosOriginales.map((producto) => {
      return new Promise<void>((resolve, reject) => {
        this.apiCategorias.getCategoryById(producto.idcategoria, this.token).subscribe(
          (categoria: any) => {
            if (categoria) {
              producto.idcategoria = categoria.nombre;
            }
            resolve();
          },
          (error) => {
            console.error('Error al obtener el nombre de la categoria:', error);
            reject();
          }
        );
      });
    });
  
    Promise.all(promesasCategorias).then(() => {
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

}
