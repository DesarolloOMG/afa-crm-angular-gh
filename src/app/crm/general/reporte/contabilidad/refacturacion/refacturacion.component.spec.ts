import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefacturacionComponent } from './refacturacion.component';

describe('RefacturacionComponent', () => {
  let component: RefacturacionComponent;
  let fixture: ComponentFixture<RefacturacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefacturacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
