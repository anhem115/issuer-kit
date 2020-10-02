import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button-box',
  templateUrl: './button-box.component.html',
  styleUrls: ['./button-box.component.sass']
})
export class ButtonBoxComponent implements OnInit {
  @Input('icon') icon: string;
  @Input('link') link: string;
  @Input('external') external: string;
  @Input('title') title: string;
  @Input('text') text: string;
  @Input('color') color: string;
  @Input('icon-color') icon_color: string;

  constructor() {
    this.color = "green";
    this.icon_color = "green"
  }

  ngOnInit(): void {

  }

}
