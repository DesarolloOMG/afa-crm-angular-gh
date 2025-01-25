import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionPdaComponent } from './recepcion-pda.component';

describe('RecepcionPdaComponent', () => {
  let component: RecepcionPdaComponent;
  let fixture: ComponentFixture<RecepcionPdaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepcionPdaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionPdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
