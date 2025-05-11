import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcreedorComponent } from './acreedor.component';

describe('AcreedorComponent', () => {
  let component: AcreedorComponent;
  let fixture: ComponentFixture<AcreedorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcreedorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcreedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
