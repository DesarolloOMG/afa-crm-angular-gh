import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresosegresosComponent } from './ingresosegresos.component';

describe('IngresosegresosComponent', () => {
  let component: IngresosegresosComponent;
  let fixture: ComponentFixture<IngresosegresosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresosegresosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresosegresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
