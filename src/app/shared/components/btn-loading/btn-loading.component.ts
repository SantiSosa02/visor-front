import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'btn-loading',
  templateUrl: './btn-loading.component.html',
  styleUrls: ['./btn-loading.component.scss']
})
export class BtnLoadingComponent implements OnInit {
  @Input('loading') loading: boolean=false;
  @Input('btnClass') btnClass: string='';
  @Input('loadingText') loadingText = 'Registrando';
  @Input('type') type: 'button' | 'submit' = 'submit';

  constructor() { }

  ngOnInit() {
  }

}
