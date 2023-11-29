import { Component } from '@angular/core';
import { AuthService } from '../../../demo/service/auth.service';
import { BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss']
})
export class PerfilUsuarioComponent {

  constructor(
    private authService: AuthService,
    private bsModalRef: BsModalRef
    ) { }


  userData: any;
  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userData = user;
    });
    // console.log(this.userData.nombre);
  }

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
    });
    this.bsModalRef.hide();  // Cierra el modal
  }

}
