import { Component, ChangeDetectorRef  } from '@angular/core';
import { ApiAbonosService } from 'src/app/demo/service/abonos.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiVentasService } from 'src/app/demo/service/ventas.service';
import { ApiClientesService } from 'src/app/demo/service/clientes.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-listar-crear-abonos-modal',
  templateUrl: './listar-crear-abonos-modal.component.html',
  styleUrls: ['./listar-crear-abonos-modal.component.scss']
})
export class ListarCrearAbonosModalComponent {

  constructor(
    private apiAbonosService: ApiAbonosService,
    private router: Router,
    private toastr: ToastrService,
    public bsModalRef: BsModalRef,
    private apiVentas: ApiVentasService,
    private cdr: ChangeDetectorRef,
    private apiClientes:ApiClientesService  
  ){}

  abonos:any[]=[];
  ventaId:number;
  valorVenta:number;
  ventas:any[]=[];
  valorRestanteTotal: number = 0; 
  valorRestante: number = 0;
  loading:boolean=false;
  camposValidos:boolean=false;
  token=localStorage.getItem('token');
  nombreClientes:string;
  numeroFactura:number;



  abono: any = {
    idventa:'',
    fechaabono:new Date().toISOString().split('T')[0],
    valorabono:''
  };

  errorMessages={
    valorAbono:''
  }

  toggleDetalles(abono: any): void {
    abono.expandido = !abono.expandido;
  }

  ngOnInit() {
    this.obtenerAbonos(this.ventaId);
    this.obtenerVentas(this.ventaId);
  }

 
  validarValorAbono(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Elimina la letra "e" si está presente
    inputValue = inputValue.replace(/e/gi, '');

    // Convierte el valor a un número
    const numericValue = parseInt(inputValue.replace(/[^\d.-]/g, ''), 10);

    // Obtener el valor restante total
    const valorRestanteTotal = this.calcularValorRestanteTotal();

    // Verifica si el campo está vacío y elimina el mensaje de error
    if (inputValue.trim() === '') {
        this.errorMessages.valorAbono = '';
    } else if (!isNaN(numericValue) && numericValue >= 1000 && numericValue <= 2000000) {
        // Si el valor es numérico y cumple con los límites, verifica si es mayor al valor restante
        if (numericValue > valorRestanteTotal) {
            this.errorMessages.valorAbono = 'El valor de abono no puede ser mayor al valor restante.';
            this.camposValidos = false;
        } else {
            this.errorMessages.valorAbono = '';
            this.camposValidos = true;
        }
    } else {
        this.errorMessages.valorAbono = 'El valor de abono debe ser un número válido (mayor o igual a 1.000 y menor que 2.000.000).';
        this.camposValidos = false;
    }

    // Asigna el valor limpio nuevamente al campo de entrada
    inputElement.value = inputValue;

    // También actualiza la propiedad vinculada al modelo de datos
    this.abono.valorAbono = inputValue;
}

  

  obtenerAbonos(idventa: number) {
    this.apiAbonosService.getAbonos(this.token).subscribe(
      (data) => {
        // Filtra los abonos relacionados con la venta específica (idventa)
        this.abonos = data.filter(abono => abono.idventa === idventa);
        console.log(this.abonos)
        // Puedes realizar otras acciones aquí si es necesario
      },
      (error) => {
        console.error('Error al obtener los abonos: ', error);
      }
    );
  }

  obtenerVentas(idventa: number) {
    this.apiVentas.getVentas(this.token).subscribe(
      (data) => {
        // Filtra los abonos relacionados con la venta específica (idventa)
        this.ventas = data.filter(venta => venta.idventa === idventa);
        console.log("Esta es la venta",this.ventas)
        // Puedes realizar otras acciones aquí si es necesario
      },
      (error) => {
        console.error('Error al obtener los abonos: ', error);
      }
    );
  }

  cerrarModal() {
    this.bsModalRef.hide();  // Cierra el modal
  }

  calcularValorRestanteTotal(): number {
    // Obtener el valor total de la venta
    const valortotalVenta = this.ventas.length > 0 ? this.ventas[0].valortotal : 0;
  
    // Calcular la suma de los abonos
    let sumaAbonos = 0;
    for (const abono of this.abonos) {
      sumaAbonos += abono.valorabono;
    }
  
    // Calcular el valor restante total
    const valorRestanteTotal = valortotalVenta - sumaAbonos;

    if(valorRestanteTotal === 0){
      this.camposValidos=false;
    }
  
    return valorRestanteTotal;
  }

  calcularValorRes(): number {
    // Obtener el valor total de la venta
    const valortotalVenta = this.ventas.length > 0 ? this.ventas[0].valortotal : 0;
  
    // Calcular la suma de los abonos
    let sumaAbonos = 0;
    for (const abono of this.abonos) {
      sumaAbonos += abono.valorabono;
    }
  
    // Calcular el valor restante total
    const valorRestanteTotal = valortotalVenta - sumaAbonos;
  
    return valorRestanteTotal;
  }

// ... (otro código)

registrarAbono() {
  // Muestra un mensaje de confirmación
  Swal.fire({
    title: 'Confirmar Registro',
    text: '¿Estás seguro de registrar este abono?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, registrar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor:'#4CAF50'
  }).then((result) => {
    if (result.value) {
      // Si el usuario confirma, realiza el registro del abono
      console.log('Haciendo clic en el botón de Registrar');

      const idventa = this.ventas.length > 0 ? this.ventas[0].idventa : null;

      if (idventa) {
        this.abono.idventa = idventa;

        this.apiAbonosService.createPayment(this.abono,this.token).subscribe(
          (abono: any) => {
            console.log('Respuesta del servidor:', abono);
            if (abono) {
              console.log('Registro exitoso');
              // Actualizar la lista de abonos sin recargar la página
              this.obtenerAbonos(idventa,);
              this.submit();
              this.abono.valorabono = '';
              console.log('ID del abono:', abono.idabono);
              console.log('Fecha del abono:', abono.fechaabono);
            } else {
              console.error('Error al registrar el abono. La respuesta no tiene el formato esperado.');
            }
          },
          (error) => {
            console.error('Error en la solicitud:', error);
          }
        );
      } else {
        console.error('No se pudo obtener un idventa válido.');
      }
    }
  });
}



cargarNombresClientes(): Promise<void[]> {
  const promesasClientes = this.ventas.map((venta) => {
    return new Promise<void>((resolve, reject) => {
      this.apiClientes.getClientById(venta.idcliente, this.token).subscribe(
        (cliente: any) => {
          if (cliente) {
            venta.idcliente = cliente.nombre + " " + cliente.apellido;
            this.nombreClientes=cliente.nombre + " " + cliente.apellido;
            console.log('Nombre del cliente obtenido:', this.nombreClientes);
          }
          resolve();
        },
        (error) => {
          console.error('Error al obtener el nombre del cliente:', error);
          reject();
        }
      );
    });
  });

  return Promise.all(promesasClientes);
}

cargarNumeroFactura(): Promise<void[]> {
  const promesasVentas = this.ventas.map((venta) => {
    return new Promise<void>((resolve, reject) => {
      // Asegúrate de que venta.id tenga un valor antes de hacer la llamada a la API
      if (venta.idventa) {
        this.apiVentas.getVentasById(venta.idventa, this.token).subscribe(
          (ventaDetallada: any) => {
            if (ventaDetallada) {
              venta.numeroFactura = ventaDetallada.numerofactura;
              this.numeroFactura=venta.numerofactura;
              resolve();
            } else {
              reject('No se pudo obtener la información de la venta.');
            }
          },
          (error) => {
            console.error('Error al obtener el número de factura:', error);
            reject(error);
          }
        );
      } else {
        reject('ID de venta no definido.');
      }
    });
  });

  return Promise.all(promesasVentas);
}


// Método para exportar abonos a Excel con nombres de clientes
exportarExcelAbonos(): void {
  // Cargar nombres de clientes antes de exportar
 Promise.all([ this.cargarNombresClientes(),this.cargarNumeroFactura()]).then(() => {
    // Obtén todos los datos de abonos
    this.apiVentas.getAbonosRelacionados(this.ventaId, this.token).subscribe(
      (data: any[] | any) => {
        // Verifica si data es un array
        if (Array.isArray(data)) {
          // Crea un array para almacenar los datos
          const excelData: any[] = [];

          // Agrega el encabezado del thead (excluyendo la columna de acciones)
          const headerData = ['Fecha Abono', 'Valor Abono', 'Numero factura', 'Nombre Cliente'];
          excelData.push(headerData);

          // Itera sobre los datos y obtén los valores de las celdas
          data.forEach((item, index) => {
            const rowData = [

              item.fechaabono,
              item.valorabono,
              this.numeroFactura,
              this.nombreClientes // Utiliza el nombre del cliente obtenido previamente
            ];
            excelData.push(rowData);
          });

          // Crea una hoja de cálculo
          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

          // Crea un libro de trabajo
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Abonos');

          // Guarda el archivo
          XLSX.writeFile(wb, 'abonos.xlsx');
        } else {
          console.error('La respuesta de la API no es un array:', data);
        }
      },
      (error) => {
        console.error('Error al obtener los abonos:', error);
      }
    );
  });
}

  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);  
    });
  }

  submit() {
    if (!this.loading) {
      this.loading = true;
  
      // Cambia el tiempo de duración del mensaje del Toastr a 1000 ms (1 segundo)
      this.toastr.success('Abono registrado con éxito.', 'Éxito', { progressBar: true, timeOut: 1000 });
      // Espera 1 segundo antes de cerrar el modal y recargar el componente
      setTimeout(() => {
        this.loading = false;
        this.reloadComponent();
      }, 1000);
    }
  }

  submit2() {
    if (!this.loading) {
      this.loading = true;
  
      // Cambia el tiempo de duración del mensaje del Toastr a 2000 ms (2 segundos)
      this.toastr.success('Todos los abonos han sido registrados.', 'Éxito', { progressBar: true, timeOut: 2000 });
  
      // Espera 2 segundos antes de cerrar el modal y recargar el componente
      setTimeout(() => {
        this.reloadComponent();
        this.cerrarModal();
      }, 2000);
    }
  }


  
  
  
}
