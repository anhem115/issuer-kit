import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-sin-field',
  templateUrl: './sin-field.component.html',
  styleUrls: ['./sin-field.component.sass']
})
export class SinFieldComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }
  ngOnInit() {
  }
}

