import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { ListarUsuariosComponent } from './views/usuarios/listar-usuarios/listar-usuarios.component';
import { AppComponent } from './app.component';
import { EditarUsuarioModalComponent } from './views/usuarios/editar-usuario-modal/editar-usuario-modal.component';
import { ListarCategoriasComponent } from './views/categorias/listar-categorias/listar-categorias.component';
import { EditarCategoriasModalComponent } from './views/categorias/editar-categorias-modal/editar-categorias-modal.component';
import { ListarProductosComponent } from './views/productos/listar-productos/listar-productos.component';
import { ListarServiciosComponent } from './views/servicios/listar-servicios/listar-servicios.component';
import { ListarClientesComponent } from './views/clientes/listar-clientes/listar-clientes.component';
import { ListarVentasComponent } from './views/ventas/listar-ventas/listar-ventas.component';
import { CrearVentaComponent } from './views/ventas/crear-venta/crear-venta.component';
import { IndexComponent } from './views/index/index/index.component';
import { LoginComponent } from './views/login/login/login.component';
import { CambiarContrasenaComponent } from './views/login/cambiar-contrasena/cambiar-contrasena.component';
import { DetalleUsuarioComponent } from './views/usuarios/detalle-usuario/detalle-usuario.component';
import { DetalleVentaComponent } from './views/ventas/detalle-venta/detalle-venta.component';
import { AuthGuard } from './demo/service/auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot([
          {
            path: '',
            redirectTo: '/login', // Redirige a la página de inicio de sesión por defecto
            pathMatch: 'full'
          },
            {
                path: '',
                component: AppLayoutComponent,
                children: [
                  {
                    path: 'index',
                    canActivate: [AuthGuard],
                    component:IndexComponent,
                  },
                  {
                    path: 'usuarios',
                    canActivate: [AuthGuard],
                    component:ListarUsuariosComponent,
                  },
                  {
                    path: 'categorias',
                    canActivate: [AuthGuard],
                    component:ListarCategoriasComponent,
                  },
                  {
                    path: 'productos',
                    canActivate: [AuthGuard],
                    component:ListarProductosComponent,
                  },
                  {
                    path: 'servicios',
                    canActivate: [AuthGuard],
                    component:ListarServiciosComponent,
                  },
                  {
                    path: 'clientes',
                    canActivate: [AuthGuard],
                    component:ListarClientesComponent,
                  },
                  {
                    path: 'ventas',
                    canActivate: [AuthGuard],
                    component:ListarVentasComponent,
                  },
                  {
                    path: 'ventas/crear',
                    canActivate: [AuthGuard],
                    component:CrearVentaComponent,
                  },
                  {
                    path: 'ventas/detalle-venta/:id',
                    canActivate: [AuthGuard],
                    component:DetalleVentaComponent,
                  },

                ],
              },
              {
                path: 'login',
                component:LoginComponent
              },
              {
                path: 'cambiar-contrasena/:token',
                component: CambiarContrasenaComponent,
              },
              
            
            // {
            //     path: '', component: AppLayoutComponent,
            //     children: [
            //       //  { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
            //      //   { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule) },
            //        // { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
            //         //{ path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
            //        // { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
            //        // { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) }
            //     ]
            // },
            // { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            // { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
             { path: 'notfound', component: NotfoundComponent },
             { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
