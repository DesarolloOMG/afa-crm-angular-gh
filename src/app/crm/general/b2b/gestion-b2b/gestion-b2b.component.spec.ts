import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionB2bComponent } from './gestion-b2b.component';

describe('GestionB2bComponent', () => {
  let component: GestionB2bComponent;
  let fixture: ComponentFixture<GestionB2bComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionB2bComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionB2bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
