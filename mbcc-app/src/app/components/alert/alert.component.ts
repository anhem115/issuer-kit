import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.sass']
})
export class AlertComponent implements OnInit {
  @Input() type: string;
  @Input() msg: string;
  @Input() title: string;
  @Input() disabled: boolean;
  public icon: string = '';

  @Output() onConfirm: EventEmitter<any> = new EventEmitter<any>();

  public accept: boolean = false;
  constructor() {

  }

  ngOnInit(): void {
    if (this.type == 'success') {
      this.icon = 'check-circle mb-success'
    } else  
    if (this.type == 'warning') {
      this.icon = 'exclamation-triangle mb-success'
    }
    if (this.type == 'danger') {
      this.icon = 'times-circle mb-danger'
    }
    if (this.type == '') {
      this.icon = 'times-circle mb-danger'
    }
  }

  confirmDataValidation() {
    this.onConfirm.emit(!this.accept);
  }
}
