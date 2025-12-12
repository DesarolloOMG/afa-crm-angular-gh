import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialTicketComponent } from './historial-ticket.component';

describe('HistorialTicketComponent', () => {
  let component: HistorialTicketComponent;
  let fixture: ComponentFixture<HistorialTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
