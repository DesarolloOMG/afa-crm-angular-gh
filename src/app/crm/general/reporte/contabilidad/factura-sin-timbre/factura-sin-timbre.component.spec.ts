import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaSinTimbreComponent } from './factura-sin-timbre.component';

describe('FacturaSinTimbreComponent', () => {
  let component: FacturaSinTimbreComponent;
  let fixture: ComponentFixture<FacturaSinTimbreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacturaSinTimbreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturaSinTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
