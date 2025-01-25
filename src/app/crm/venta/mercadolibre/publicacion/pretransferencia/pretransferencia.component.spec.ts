import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PretransferenciaComponent } from './pretransferencia.component';

describe('PretransferenciaComponent', () => {
  let component: PretransferenciaComponent;
  let fixture: ComponentFixture<PretransferenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PretransferenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PretransferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
