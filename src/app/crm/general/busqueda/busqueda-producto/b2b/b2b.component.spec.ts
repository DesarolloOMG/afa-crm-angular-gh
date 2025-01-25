import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { B2BComponent } from './b2b.component';

describe('B2BComponent', () => {
    let component: B2BComponent;
    let fixture: ComponentFixture<B2BComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [B2BComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(B2BComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
