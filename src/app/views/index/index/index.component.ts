import { Component, inject } from '@angular/core';
import { tap } from 'rxjs';
import { User } from 'src/app/demo/interfaces';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  constructor(
  
  ) {}

  private authService = inject(AuthService);

  get user(): User | null {
    let currentUser: User | null;

    this.authService.currentUser
      .pipe(
        tap(user => {
          currentUser = user;
        })
      )
      .subscribe();

    return currentUser;
  }
}
