import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuaweiComponent } from './huawei.component';

describe('HuaweiComponent', () => {
  let component: HuaweiComponent;
  let fixture: ComponentFixture<HuaweiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuaweiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuaweiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
