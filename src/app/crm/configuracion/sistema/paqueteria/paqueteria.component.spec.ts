import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaqueteriaComponent } from './paqueteria.component';

describe('PaqueteriaComponent', () => {
  let component: PaqueteriaComponent;
  let fixture: ComponentFixture<PaqueteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaqueteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaqueteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
