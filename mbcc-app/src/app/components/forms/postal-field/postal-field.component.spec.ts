import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostalFieldComponent } from './postal-field.component';

describe('PostalFieldComponent', () => {
  let component: PostalFieldComponent;
  let fixture: ComponentFixture<PostalFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostalFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostalFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
