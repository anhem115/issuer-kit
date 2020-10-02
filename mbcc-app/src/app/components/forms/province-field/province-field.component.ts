import { Component, Input } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Provinces } from './provinces';

// const Provinces = require './provinces.json';


@Component({
  selector: 'app-province-field',
  templateUrl: './province-field.component.html',
  styleUrls: ['./province-field.component.sass']
})
export class ProvinceFieldComponent extends FieldType {

  @Input() label: string

  public all_provinces: any ;

  ngOnInit(): void {

    console.log(Provinces);

  }

}
