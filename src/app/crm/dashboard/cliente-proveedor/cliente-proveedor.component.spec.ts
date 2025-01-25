import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteProveedorComponent } from './cliente-proveedor.component';

describe('ClienteProveedorComponent', () => {
  let component: ClienteProveedorComponent;
  let fixture: ComponentFixture<ClienteProveedorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClienteProveedorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
