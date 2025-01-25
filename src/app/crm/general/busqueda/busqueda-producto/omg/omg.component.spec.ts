import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OmgComponent } from './omg.component';

describe('OmgComponent', () => {
  let component: OmgComponent;
  let fixture: ComponentFixture<OmgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OmgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OmgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
