import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntaRespuestaComponent } from './pregunta-respuesta.component';

describe('PreguntaRespuestaComponent', () => {
  let component: PreguntaRespuestaComponent;
  let fixture: ComponentFixture<PreguntaRespuestaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreguntaRespuestaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreguntaRespuestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
