import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalizarComponent } from './globalizar.component';

describe('GlobalizarComponent', () => {
  let component: GlobalizarComponent;
  let fixture: ComponentFixture<GlobalizarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalizarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
