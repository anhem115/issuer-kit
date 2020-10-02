import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-postal-field',
  templateUrl: './postal-field.component.html',
  styleUrls: ['./postal-field.component.sass']
})
export class PostalFieldComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }
  ngOnInit() {
  }
}