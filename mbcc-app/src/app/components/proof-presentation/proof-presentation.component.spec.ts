import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofPresentationComponent } from './proof-presentation.component';

describe('ProofPresentationComponent', () => {
  let component: ProofPresentationComponent;
  let fixture: ComponentFixture<ProofPresentationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofPresentationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
