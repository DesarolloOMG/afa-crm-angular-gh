import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizacionRequisicionComponent } from './autorizacion-requisicion.component';

describe('AutorizacionRequisicionComponent', () => {
  let component: AutorizacionRequisicionComponent;
  let fixture: ComponentFixture<AutorizacionRequisicionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorizacionRequisicionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizacionRequisicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
