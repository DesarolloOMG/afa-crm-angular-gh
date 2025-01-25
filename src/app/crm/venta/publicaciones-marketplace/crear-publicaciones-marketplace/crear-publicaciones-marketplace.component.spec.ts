import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPublicacionesMarketplaceComponent } from './crear-publicaciones-marketplace.component';

describe('CrearPublicacionesMarketplaceComponent', () => {
  let component: CrearPublicacionesMarketplaceComponent;
  let fixture: ComponentFixture<CrearPublicacionesMarketplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearPublicacionesMarketplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPublicacionesMarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
