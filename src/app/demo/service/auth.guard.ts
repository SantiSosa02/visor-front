// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';

import { AuthStatus } from '../interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      return this.authService.authStatus.pipe(
        take(1), // to ensure the observable completes after emitting one value
        map(authStatus => {
          if (authStatus === AuthStatus.authenticated || this.retrieveTokenFromStorage()) {
            return true;
          } else {
            // Redirige a la página de inicio de sesión si no está autenticado
            return this.router.createUrlTree(['/login']);
          }
        })
      );
    }
  
    private retrieveTokenFromStorage(): string | null {
      return localStorage.getItem('token');
    }
  }