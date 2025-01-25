import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGastoComponent } from './crear-gasto.component';

describe('CrearGastoComponent', () => {
  let component: CrearGastoComponent;
  let fixture: ComponentFixture<CrearGastoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearGastoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
