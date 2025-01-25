import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostoSobreVentaComponent } from './costo-sobre-venta.component';

describe('CostoSobreVentaComponent', () => {
  let component: CostoSobreVentaComponent;
  let fixture: ComponentFixture<CostoSobreVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostoSobreVentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostoSobreVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
