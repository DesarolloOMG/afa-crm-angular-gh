import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarVentasLinioComponent } from './importar-ventas-linio.component';

describe('ImportarVentasLinioComponent', () => {
  let component: ImportarVentasLinioComponent;
  let fixture: ComponentFixture<ImportarVentasLinioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportarVentasLinioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarVentasLinioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
