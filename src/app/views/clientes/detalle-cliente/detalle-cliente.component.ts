import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-detalle-cliente',
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.scss']
})
export class DetalleClienteComponent {


  constructor(
    private apiClientes:ApiClientesService,
    private toastr: ToastrService,
    private router: Router,
    private bsModalRef: BsModalRef,
    private route: ActivatedRoute
  ){
    this.route.params.subscribe(params => {
      this.clientId= +params['id'];
    })
  }

  clientId:number;
  cliente:any;
  datosOriginales:any;
  idcliente:number; 
  token=localStorage.getItem('token');
  datosModificados:any={
    nombre:'',
    apellido:'',
    telefono:'',
    correo:''
  }



 
  ngOnInit(){
    this.apiClientes.getClientById(this.clientId, this.token).subscribe(
      (data) => {
        if(data){
          this.datosOriginales={
            nombre:data.nombre,
            apellido:data.apellido,
            telefono:data.telefono,
            correo:data.correo,
          }
          this.datosModificados.nombre=data.nombre;
          this.datosModificados.apellido=data.apellido;
          this.datosModificados.telefono=data.telefono;
          this.datosModificados.correo=data.correo;
        }else{
          console.error('No se encontreo el cliente con el ID proporcionado.')
        }
      }
    )
  }

 

  cerrarModal(){
    this.bsModalRef.onHidden.subscribe(() => {
      this.router.navigate(['/clientes'])
    })
    this.bsModalRef.hide();
  }

}
