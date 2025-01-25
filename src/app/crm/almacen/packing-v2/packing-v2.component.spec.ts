import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingV2Component } from './packing-v2.component';

describe('PackingV2Component', () => {
  let component: PackingV2Component;
  let fixture: ComponentFixture<PackingV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackingV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackingV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
