import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarMarketplacesComponent } from './gestionar-marketplaces.component';

describe('GestionarMarketplacesComponent', () => {
  let component: GestionarMarketplacesComponent;
  let fixture: ComponentFixture<GestionarMarketplacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionarMarketplacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarMarketplacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
