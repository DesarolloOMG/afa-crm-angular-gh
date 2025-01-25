import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DessaldarComponent } from './dessaldar.component';

describe('DessaldarComponent', () => {
  let component: DessaldarComponent;
  let fixture: ComponentFixture<DessaldarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DessaldarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DessaldarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
