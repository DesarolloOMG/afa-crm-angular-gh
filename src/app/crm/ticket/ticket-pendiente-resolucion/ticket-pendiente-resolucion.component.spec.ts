import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPendienteResolucionComponent } from './ticket-pendiente-resolucion.component';

describe('TicketPendienteResolucionComponent', () => {
  let component: TicketPendienteResolucionComponent;
  let fixture: ComponentFixture<TicketPendienteResolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketPendienteResolucionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketPendienteResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
