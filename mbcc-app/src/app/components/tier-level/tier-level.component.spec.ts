import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TierLevelComponent } from './tier-level.component';

describe('TierLevelComponent', () => {
  let component: TierLevelComponent;
  let fixture: ComponentFixture<TierLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TierLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TierLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
