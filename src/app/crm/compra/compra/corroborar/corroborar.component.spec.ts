import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CorroborarComponent } from './corroborar.component';

describe('CorroborarComponent', () => {
  let component: CorroborarComponent;
  let fixture: ComponentFixture<CorroborarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorroborarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorroborarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
