import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { User } from '../../app/demo/interfaces/user.interfaces';
import { AuthService } from '../demo/service/auth.service';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PerfilUsuarioComponent } from './perfil/perfil-usuario/perfil-usuario.component';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items!: MenuItem[];
    currentTheme: string =' '; 
    userData: any;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,
      private authService: AuthService,
      private router: Router,
      private modalRef: BsModalRef,
      private modalService: BsModalService

      ) { }
      


    replaceThemeLink(href: string, onComplete: Function) {
        const id = 'theme-css';
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            themeLink.remove();
            cloneLinkElement.setAttribute('id', id);
            onComplete();
        });
    }

    toggleTheme() {
      const newTheme = this.currentTheme === 'bootstrap4-dark-blue' ? 'bootstrap4-light-blue' : 'bootstrap4-dark-blue';
      const newColorScheme = this.currentTheme === 'bootstrap4-dark-blue' ? 'light' : 'dark';
  
      const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
      const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, newTheme);
  
      this.replaceThemeLink(newHref, () => {
        this.currentTheme = newTheme;
        this.layoutService.config.theme = newTheme;
        this.layoutService.config.colorScheme = newColorScheme;
        this.layoutService.onConfigUpdate();
  
        // Guarda el tema actual en el almacenamiento local
        localStorage.setItem('currentTheme', newTheme);
      });
    }
  
    ngOnInit() {
      // Recupera el tema almacenado en el almacenamiento local al cargar la página
      const savedTheme = localStorage.getItem('currentTheme');
      if (savedTheme) {
        this.currentTheme = savedTheme;
  
        // Actualiza la configuración de colorScheme si es necesario
        if (this.currentTheme === 'bootstrap4-dark-blue') {
          this.layoutService.config.colorScheme = 'dark';
        } else {
          this.layoutService.config.colorScheme = 'light';
        }
      }
      this.authService.currentUser.subscribe(user => {
        this.userData = user;
      });
     
    } 

    verPerfil() {
      this.modalRef = this.modalService.show(PerfilUsuarioComponent,{
        backdrop: 'static'
      });
    }


    logout() {
      // Mostrar SweetAlert de confirmación
      Swal.fire({
        title: 'Cerrar Sesión',
        text: '¿Estás seguro de que deseas cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
    }
}
