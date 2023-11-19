import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiProductosService } from 'src/app/demo/service/productos.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiCategoriaService } from 'src/app/demo/service/categorias.service';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.component.html',
  styleUrls: ['./detalle-producto.component.scss']
})
export class DetalleProductoComponent {

  
  productId: number;
  producto: any; // Aquí deberías definir la estructura de datos para el usuario
  datosOriginales:any;
  idproducto: number;


datosModificados:any ={
  nombre: '',
  idcategoria: '',
  stock_minimo:'',
  cantidad:'',
  precio_venta:'',
}


categorias: any[] = [];
token = localStorage.getItem('token')




  constructor(private route: ActivatedRoute,
    private apiProducto : ApiProductosService,
    private toastr: ToastrService,
    private router : Router,
    public bsModalRef: BsModalRef, 
    private apíCategorias: ApiCategoriaService
    ) 
    {
    this.route.params.subscribe(params => {
      this.productId = +params['id']; // El "+" convierte el valor en un número
    });
  }
  
  camposCompletos(): boolean {
    return (
      !!this.datosModificados.nombre &&
      !!this.datosModificados.idcategoria &&
      !!this.datosModificados.stock_minimo &&
      !!this.datosModificados.cantidad &&
      !!this.datosModificados.precio_venta 
    );
  }




  ngOnInit() {
    
    this.apiProducto.getProductId(this.productId, this.token).subscribe((data) => {
        if (data) {

          this.datosOriginales={
            nombre:data.nombre,
            idcategoria:data.idcategoria,
            stock_minimo:data.stock_minimo,
            cantidad:data.cantidad,
            precio_venta:data.precio_venta
          };
          
          this.datosModificados.nombre = data.nombre ;
          this.datosModificados.idcategoria = data.idcategoria ;
          this.datosModificados.stock_minimo = data.stock_minimo ;
          this.datosModificados.cantidad = data.cantidad ;
          this.datosModificados.precio_venta = data.precio_venta;
          
          this.apíCategorias.getCategorias(this.token).subscribe((categorias) => {
            this.categorias = categorias;
          });
          // Realiza cualquier otra lógica que necesites con los datos del usuario
        } else {
          // Manejar el caso en que no se encontraron datos del usuario
          console.error('No se encontraron datos del usuario con el ID proporcionado.');
        }
      });
  }

  

  cerrarModal() {
    this.bsModalRef.onHidden.subscribe(() => {
      // Esta función se ejecutará después de que el modal se haya ocultado completamente
      this.router.navigate(['/productos']);
    });
    this.bsModalRef.hide();  // Cierra el modal
  }

 
}
