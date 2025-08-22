import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostoPrecioPromedioComponent } from './costo-precio-promedio.component';

describe('CostoPrecioPromedioComponent', () => {
  let component: CostoPrecioPromedioComponent;
  let fixture: ComponentFixture<CostoPrecioPromedioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostoPrecioPromedioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostoPrecioPromedioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
