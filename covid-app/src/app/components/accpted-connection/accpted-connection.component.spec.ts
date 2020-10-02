import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccptedConnectionComponent } from './accpted-connection.component';

describe('AccptedConnectionComponent', () => {
  let component: AccptedConnectionComponent;
  let fixture: ComponentFixture<AccptedConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccptedConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccptedConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
