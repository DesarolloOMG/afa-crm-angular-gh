import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedoresB2bComponent } from './proveedores-b2b.component';

describe('ProveedoresB2bComponent', () => {
  let component: ProveedoresB2bComponent;
  let fixture: ComponentFixture<ProveedoresB2bComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProveedoresB2bComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProveedoresB2bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
