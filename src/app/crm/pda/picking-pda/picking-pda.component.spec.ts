import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickingPdaComponent } from './picking-pda.component';

describe('PickingPdaComponent', () => {
  let component: PickingPdaComponent;
  let fixture: ComponentFixture<PickingPdaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickingPdaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickingPdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
