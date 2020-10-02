import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.sass']
})
export class NumberFieldComponent extends FieldType {
  get type() {
    return this.to.type || 'text';
  }
}