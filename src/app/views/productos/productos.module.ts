import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarProductosComponent } from './listar-productos/listar-productos.component';
import { CrearProductosModalComponent } from './crear-productos-modal/crear-productos-modal.component';
import { EditarProductosModalComponent } from './editar-productos-modal/editar-productos-modal.component';
import { AgregarCantidadModalComponent } from './agregar-cantidad-modal/agregar-cantidad-modal.component';
import { DetalleProductoComponent } from './detalle-producto/detalle-producto.component';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule
  ]
})
export class ProductosModule { }
