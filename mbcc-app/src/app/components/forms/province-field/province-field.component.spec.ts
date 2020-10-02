import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinceFieldComponent } from './province-field.component';

describe('ProvinceFieldComponent', () => {
  let component: ProvinceFieldComponent;
  let fixture: ComponentFixture<ProvinceFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvinceFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvinceFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
