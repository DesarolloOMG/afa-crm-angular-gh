import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteOrdenCompraRecepcionComponent } from './reporte-orden-compra-recepcion.component';

describe('ReporteOrdenCompraRecepcionComponent', () => {
  let component: ReporteOrdenCompraRecepcionComponent;
  let fixture: ComponentFixture<ReporteOrdenCompraRecepcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteOrdenCompraRecepcionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteOrdenCompraRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
