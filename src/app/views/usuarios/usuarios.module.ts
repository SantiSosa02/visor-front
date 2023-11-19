import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarUsuariosComponent } from './listar-usuarios/listar-usuarios.component';
import { Routes } from '@angular/router';
import { DetalleUsuarioComponent } from './detalle-usuario/detalle-usuario.component';



const routes: Routes=[
    {
    path: "usuarios",
    data: {
      title: "Usuarios",
      urls: [{ title: "Usuarios", url: "/usuarios" }, { title: "Usuarios" }],
    },
    component: ListarUsuariosComponent,
  },
]

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule
  ]
})
export class UsuariosModule { }
