import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarComercialComponent } from './importar-comercial.component';

describe('ImportarComercialComponent', () => {
  let component: ImportarComercialComponent;
  let fixture: ComponentFixture<ImportarComercialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportarComercialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarComercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
