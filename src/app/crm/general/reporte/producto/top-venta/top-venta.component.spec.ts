import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopVentaComponent } from './top-venta.component';

describe('TopVentaComponent', () => {
  let component: TopVentaComponent;
  let fixture: ComponentFixture<TopVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopVentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
