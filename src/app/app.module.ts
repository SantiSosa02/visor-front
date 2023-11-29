import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service'; 
import { PhotoService } from './demo/service/photo.service';
import { ListarUsuariosComponent } from './views/usuarios/listar-usuarios/listar-usuarios.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from 'primeng/api';
import { BtnLoadingComponent } from './shared/components/btn-loading/btn-loading.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CrearUsuarioModalComponent } from './views/usuarios/crear-usuario-modal/crear-usuario-modal.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { EditarUsuarioModalComponent } from './views/usuarios/editar-usuario-modal/editar-usuario-modal.component';
import { ListarCategoriasComponent } from './views/categorias/listar-categorias/listar-categorias.component';
import { CrearCategoriasModalComponent } from './views/categorias/crear-categorias-modal/crear-categorias-modal.component';
import { EditarCategoriasModalComponent } from './views/categorias/editar-categorias-modal/editar-categorias-modal.component';
import { ListarProductosComponent } from './views/productos/listar-productos/listar-productos.component';
import { CrearProductosModalComponent } from './views/productos/crear-productos-modal/crear-productos-modal.component';
import { EditarProductosModalComponent } from './views/productos/editar-productos-modal/editar-productos-modal.component';
import { AgregarCantidadModalComponent } from './views/productos/agregar-cantidad-modal/agregar-cantidad-modal.component';
import { ListarServiciosComponent } from './views/servicios/listar-servicios/listar-servicios.component';
import { CrearServiciosModalComponent } from './views/servicios/crear-servicios-modal/crear-servicios-modal.component';
import { EditarServiciosModalComponent } from './views/servicios/editar-servicios-modal/editar-servicios-modal.component';
import { ListarClientesComponent } from './views/clientes/listar-clientes/listar-clientes.component';
import { CrearClientesModalComponent } from './views/clientes/crear-clientes-modal/crear-clientes-modal.component';
import { EditarClientesModalComponent } from './views/clientes/editar-clientes-modal/editar-clientes-modal.component';
import { ListarVentasComponent } from './views/ventas/listar-ventas/listar-ventas.component';
import { CrearVentaComponent } from './views/ventas/crear-venta/crear-venta.component';
import { TableModule } from 'primeng/table';
import { ListarCrearAbonosModalComponent } from './views/abonos/listar-crear-abonos-modal/listar-crear-abonos-modal.component';
import { IndexComponent } from './views/index/index/index.component';
import { LoginComponent } from './views/login/login/login.component';
import { CambiarContrasenaComponent } from './views/login/cambiar-contrasena/cambiar-contrasena.component';
import { DetalleProductoComponent } from './views/productos/detalle-producto/detalle-producto.component';
import { DetalleUsuarioComponent } from './views/usuarios/detalle-usuario/detalle-usuario.component';
import { DetalleCategoriaComponent } from './views/categorias/detalle-categoria/detalle-categoria.component';
import { DetalleServicioComponent } from './views/servicios/detalle-servicio/detalle-servicio.component';
import { DetalleClienteComponent } from './views/clientes/detalle-cliente/detalle-cliente.component';
import { DetalleVentaComponent } from './views/ventas/detalle-venta/detalle-venta.component';
import { RecuperarComponent } from './views/login/recuperar/recuperar.component';
import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DropdownModule } from 'primeng/dropdown';
import { CookieService } from 'ngx-cookie-service';
import { JwtInterceptorInterceptor } from './demo/service/token.service';
import { PerfilUsuarioComponent } from './layout/perfil/perfil-usuario/perfil-usuario.component';
import { DialogModule } from 'primeng/dialog';



@NgModule({
    declarations: [
        AppComponent, 
        NotfoundComponent, 
        ListarUsuariosComponent, 
        BtnLoadingComponent,
        CrearUsuarioModalComponent,
        EditarUsuarioModalComponent,
        ListarCategoriasComponent,
        CrearCategoriasModalComponent,
        EditarCategoriasModalComponent,
        ListarProductosComponent,
        CrearProductosModalComponent,
        EditarProductosModalComponent,
        AgregarCantidadModalComponent,
        ListarServiciosComponent,
        CrearServiciosModalComponent,
        EditarServiciosModalComponent,
        ListarClientesComponent,
        CrearClientesModalComponent,
        EditarClientesModalComponent,
        ListarVentasComponent,
        CrearVentaComponent,
        ListarCrearAbonosModalComponent,
        IndexComponent,
        LoginComponent,
        CambiarContrasenaComponent,
        DetalleProductoComponent,
        DetalleUsuarioComponent,
        DetalleCategoriaComponent,
        DetalleServicioComponent,
        DetalleClienteComponent,
        DetalleVentaComponent,
        RecuperarComponent,
        CambiarContrasenaComponent
        
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ToastrModule.forRoot({
            positionClass:'toast-top-right',
            preventDuplicates:true,
            timeOut: 2000,
            progressBar: true,
            enableHtml: true,
            toastClass: 'custom-toast '

          }),
        SharedModule,
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        ModalModule.forRoot(),
        TableModule,    
        ToolbarModule,
        MenubarModule ,
		ButtonModule,
		RippleModule,
		SplitButtonModule,
		ToggleButtonModule,
        DropdownModule,
        DialogModule,
    
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy},
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorInterceptor, multi: true },
        CountryService, CustomerService, EventService, IconService, NodeService, // Corregido el provider
        PhotoService, ProductService,
        
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
