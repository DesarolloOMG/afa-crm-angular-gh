import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndemnizacionComponent } from './indemnizacion.component';

describe('IndemnizacionComponent', () => {
  let component: IndemnizacionComponent;
  let fixture: ComponentFixture<IndemnizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndemnizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndemnizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
