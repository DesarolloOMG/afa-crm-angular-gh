import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidarVentasComponent } from './validar-ventas.component';

describe('ValidarVentasComponent', () => {
  let component: ValidarVentasComponent;
  let fixture: ComponentFixture<ValidarVentasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidarVentasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidarVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
