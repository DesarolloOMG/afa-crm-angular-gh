import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpresoraComponent } from './impresora.component';

describe('ImpresoraComponent', () => {
  let component: ImpresoraComponent;
  let fixture: ComponentFixture<ImpresoraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpresoraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpresoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
