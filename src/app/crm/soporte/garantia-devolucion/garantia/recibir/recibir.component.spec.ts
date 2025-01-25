import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecibirComponent } from './recibir.component';

describe('RecibirComponent', () => {
  let component: RecibirComponent;
  let fixture: ComponentFixture<RecibirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecibirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecibirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
