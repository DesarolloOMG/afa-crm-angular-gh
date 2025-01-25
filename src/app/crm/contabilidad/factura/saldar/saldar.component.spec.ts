import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldarComponent } from './saldar.component';

describe('SaldarComponent', () => {
  let component: SaldarComponent;
  let fixture: ComponentFixture<SaldarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaldarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaldarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
