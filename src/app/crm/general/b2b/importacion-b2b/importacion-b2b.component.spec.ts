import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportacionB2bComponent } from './importacion-b2b.component';

describe('ImportacionB2bComponent', () => {
  let component: ImportacionB2bComponent;
  let fixture: ComponentFixture<ImportacionB2bComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportacionB2bComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportacionB2bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
