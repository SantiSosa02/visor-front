import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private sessionExpiredMessageShown = false;
    private pageReloaded = false; 


    constructor(private router: Router, 
        private toastr: ToastrService,
        private authService: AuthService
        ) { }
        

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // Aquí puedes realizar acciones después de recibir una respuesta exitosa
                }
            }, (error: any) => {
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401 && !this.sessionExpiredMessageShown) {
                        // Mostrar el mensaje de error solo una vez
                 
                        this.sessionExpiredMessageShown = true;
                           // Mostrar SweetAlert de carga
                           Swal.fire({
                            title: 'Su sesión ha expirado.',
                            timer: 2000, // Duración de 2 segundos
                            timerProgressBar: true,
                            didOpen: () => {
                                Swal.showLoading()
                            }
                        }).then(() => {
                            // Después de 2 segundos, ejecutar el resto del código
                            this.authService.logout();
                            // Si la página no ha sido recargada antes, recargarla
                            if (!this.pageReloaded) {
                                this.pageReloaded = true;
                                window.location.reload();
                            } else {
                                // Si ya se ha recargado una vez, redirigir al login
                                this.router.navigate(['/login']);
                            }
                        });
                     
                    }
                }

            })
            
        );
    }
}