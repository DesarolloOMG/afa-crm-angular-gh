import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackorderComponent } from './backorder.component';

describe('BackorderComponent', () => {
  let component: BackorderComponent;
  let fixture: ComponentFixture<BackorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
