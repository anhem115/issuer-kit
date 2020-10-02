import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.sass']
})

export class DateFieldComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }
  ngOnInit() {
  }
}
