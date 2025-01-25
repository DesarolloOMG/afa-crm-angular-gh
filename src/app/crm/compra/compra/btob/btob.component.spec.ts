import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtobComponent } from './btob.component';

describe('BtobComponent', () => {
  let component: BtobComponent;
  let fixture: ComponentFixture<BtobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
