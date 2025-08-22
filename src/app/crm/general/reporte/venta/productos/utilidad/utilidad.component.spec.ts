import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilidadComponent } from './utilidad.component';

describe('UtilidadComponent', () => {
  let component: UtilidadComponent;
  let fixture: ComponentFixture<UtilidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
