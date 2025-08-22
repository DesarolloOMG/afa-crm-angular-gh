import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTransitoComponent } from './producto-transito.component';

describe('ProductoTransitoComponent', () => {
  let component: ProductoTransitoComponent;
  let fixture: ComponentFixture<ProductoTransitoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductoTransitoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductoTransitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
