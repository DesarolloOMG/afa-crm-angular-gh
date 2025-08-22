import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntiguedadComponent } from './antiguedad.component';

describe('AntiguedadComponent', () => {
  let component: AntiguedadComponent;
  let fixture: ComponentFixture<AntiguedadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AntiguedadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntiguedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
