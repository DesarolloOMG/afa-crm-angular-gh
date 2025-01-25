import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinonimoComponent } from './sinonimo.component';

describe('SinonimoComponent', () => {
  let component: SinonimoComponent;
  let fixture: ComponentFixture<SinonimoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinonimoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinonimoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
