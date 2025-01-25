import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarVentasWalmartComponent } from './importar-ventas-walmart.component';

describe('ImportarVentasWalmartComponent', () => {
  let component: ImportarVentasWalmartComponent;
  let fixture: ComponentFixture<ImportarVentasWalmartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportarVentasWalmartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarVentasWalmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
