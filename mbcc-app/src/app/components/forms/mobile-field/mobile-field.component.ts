import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-mobile-field',
  templateUrl: './mobile-field.component.html',
  styleUrls: ['./mobile-field.component.sass']
})
export class MobileFieldComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }
  ngOnInit() {
  }
}