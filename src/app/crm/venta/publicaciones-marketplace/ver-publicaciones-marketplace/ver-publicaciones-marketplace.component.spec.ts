import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPublicacionesMarketplaceComponent } from './ver-publicaciones-marketplace.component';

describe('VerPublicacionesMarketplaceComponent', () => {
  let component: VerPublicacionesMarketplaceComponent;
  let fixture: ComponentFixture<VerPublicacionesMarketplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerPublicacionesMarketplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPublicacionesMarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
