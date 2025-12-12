import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTicketComponent } from './crear-ticket.component';

describe('CrearTicketComponent', () => {
  let component: CrearTicketComponent;
  let fixture: ComponentFixture<CrearTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
