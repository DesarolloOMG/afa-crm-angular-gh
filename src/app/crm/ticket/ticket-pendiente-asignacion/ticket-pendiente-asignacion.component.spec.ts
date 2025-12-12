import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPendienteAsignacionComponent } from './ticket-pendiente-asignacion.component';

describe('TicketPendienteAsignacionComponent', () => {
  let component: TicketPendienteAsignacionComponent;
  let fixture: ComponentFixture<TicketPendienteAsignacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketPendienteAsignacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketPendienteAsignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
