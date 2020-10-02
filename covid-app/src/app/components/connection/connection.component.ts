import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Observable } from 'rxjs';
import { Data } from '@angular/router';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent implements OnInit {
  public connections$: Observable<any>;
  
  constructor(private data: DataService) { }

  ngOnInit(): void {
  }

}
