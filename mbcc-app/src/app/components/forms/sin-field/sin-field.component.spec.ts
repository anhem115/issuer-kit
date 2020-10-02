import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinFieldComponent } from './sin-field.component';

describe('SinFieldComponent', () => {
  let component: SinFieldComponent;
  let fixture: ComponentFixture<SinFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
