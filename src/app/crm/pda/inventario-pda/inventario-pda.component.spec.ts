import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioPdaComponent } from './inventario-pda.component';

describe('InventarioPdaComponent', () => {
  let component: InventarioPdaComponent;
  let fixture: ComponentFixture<InventarioPdaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventarioPdaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioPdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
