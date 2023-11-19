import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-detalle-categoria',
  templateUrl: './detalle-categoria.component.html',
  styleUrls: ['./detalle-categoria.component.scss']
})
export class DetalleCategoriaComponent {


  
  categoryId: number;
  categoria: any;
  datosOriginales:any;
  idcategoria: number;


datosModificados:any ={
    nombre:'',
    descripcion:'',
    estado:false
}


  constructor(private route: ActivatedRoute,
    private apicategoria : ApiCategoriaService,
    private toastr: ToastrService,
    private router : Router,
    public bsModalRef: BsModalRef
    ) 
    {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id']; // El "+" convierte el valor en un número
    });
  }

 

  ngOnInit() {
    const token =localStorage.getItem('token');
    this.apicategoria.getCategoryById(this.categoryId, token).subscribe((data) => {
        if (data) {

          this.datosOriginales={
            nombre:data.nombre,
            descripcion:data.descripcion
          };
          
          this.datosModificados.nombre = data.nombre ;
          this.datosModificados.descripcion = data.descripcion;
      
          // Realiza cualquier otra lógica que necesites con los datos del usuario
        } else {
          // Manejar el caso en que no se encontraron datos del usuario
          console.error('No se encontraron datos de la categoria con el ID proporcionado.');
        }
      });
  }



  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/categorias']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }

 
}
