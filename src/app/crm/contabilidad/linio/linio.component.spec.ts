import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinioComponent } from './linio.component';

describe('LinioComponent', () => {
  let component: LinioComponent;
  let fixture: ComponentFixture<LinioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
