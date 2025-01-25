import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarNotaCreditoComponent } from './buscar-nota-credito.component';

describe('BuscarNotaCreditoComponent', () => {
  let component: BuscarNotaCreditoComponent;
  let fixture: ComponentFixture<BuscarNotaCreditoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarNotaCreditoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarNotaCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
