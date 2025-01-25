import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizadaConDiferenciaComponent } from './finalizada-con-diferencia.component';

describe('FinalizadaConDiferenciaComponent', () => {
  let component: FinalizadaConDiferenciaComponent;
  let fixture: ComponentFixture<FinalizadaConDiferenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalizadaConDiferenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalizadaConDiferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
