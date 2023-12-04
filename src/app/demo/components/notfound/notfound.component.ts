import { Component } from '@angular/core';
import { Location } from '@angular/common';


@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
    styleUrls: ['./notfound.scss']
})
export class NotfoundComponent { 

    constructor(
        private location: Location
        ) {}

    volverPaginaAnterior() {
        this.location.back();
      }
}