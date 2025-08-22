import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteB2bComponent } from './reporte-b2b.component';

describe('ReporteB2bComponent', () => {
  let component: ReporteB2bComponent;
  let fixture: ComponentFixture<ReporteB2bComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteB2bComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteB2bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
