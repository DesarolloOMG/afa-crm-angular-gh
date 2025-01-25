import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefacturarComponent } from './refacturar.component';

describe('RefacturarComponent', () => {
  let component: RefacturarComponent;
  let fixture: ComponentFixture<RefacturarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefacturarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefacturarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
