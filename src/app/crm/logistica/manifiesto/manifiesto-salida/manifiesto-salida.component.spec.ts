import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifiestoSalidaComponent } from './manifiesto-salida.component';

describe('ManifiestoSalidaComponent', () => {
  let component: ManifiestoSalidaComponent;
  let fixture: ComponentFixture<ManifiestoSalidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManifiestoSalidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifiestoSalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
