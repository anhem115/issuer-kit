import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentBenefitComponent } from './sent-benefit.component';

describe('SentBenefitComponent', () => {
  let component: SentBenefitComponent;
  let fixture: ComponentFixture<SentBenefitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentBenefitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
