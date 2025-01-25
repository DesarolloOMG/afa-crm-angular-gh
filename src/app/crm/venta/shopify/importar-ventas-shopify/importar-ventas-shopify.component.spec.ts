import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarVentasShopifyComponent } from './importar-ventas-shopify.component';

describe('ImportarVentasShopifyComponent', () => {
  let component: ImportarVentasShopifyComponent;
  let fixture: ComponentFixture<ImportarVentasShopifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportarVentasShopifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarVentasShopifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
