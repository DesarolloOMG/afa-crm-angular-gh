import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaCrmComponent } from './venta-crm.component';

describe('VentaCrmComponent', () => {
  let component: VentaCrmComponent;
  let fixture: ComponentFixture<VentaCrmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaCrmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaCrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
