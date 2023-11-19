import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiciosService } from 'src/app/demo/service/servicios.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-detalle-servicio',
  templateUrl: './detalle-servicio.component.html',
  styleUrls: ['./detalle-servicio.component.scss']
})
export class DetalleServicioComponent {

  
  constructor(
    private apiServicio: ApiServiciosService,
    private toastr: ToastrService,
    private router: Router,
    public bsModalRef: BsModalRef,
    private route: ActivatedRoute
  ){
    this.route.params.subscribe(params =>{
      this.serviceId= +params['id'];
    })
  }
  serviceId:number;
  servicio:any;
  datosOriginales:any;
  idservicio:number;
  token=localStorage.getItem('token');

  datosModificados:any={
    nombre:'',
    descripcion:''
  }

  ngOnInit(){
    this.apiServicio.getServiceById(this.serviceId, this.token).subscribe(
      (data) =>{
        if(data){
          this.datosOriginales={
            nombre:data.nombre,
            descripcion:data.descripcion
          }
          this.datosModificados.nombre=data.nombre;
          this.datosModificados.descripcion=data.descripcion;
        }else{
          console.error('No se encontro el servicio con el ID proporcionado.')
        }
      }
    )
  }

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/servicios']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }

}
