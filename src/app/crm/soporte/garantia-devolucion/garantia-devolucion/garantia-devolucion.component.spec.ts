import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GarantiaDevolucionComponent } from './garantia-devolucion.component';

describe('GarantiaDevolucionComponent', () => {
  let component: GarantiaDevolucionComponent;
  let fixture: ComponentFixture<GarantiaDevolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GarantiaDevolucionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GarantiaDevolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
