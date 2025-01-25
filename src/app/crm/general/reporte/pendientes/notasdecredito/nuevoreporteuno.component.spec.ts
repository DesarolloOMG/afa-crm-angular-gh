import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasDeCreditoComponent } from './notasdecredito.component';

describe('NotasDeCreditoComponent', () => {
    let component: NotasDeCreditoComponent;
    let fixture: ComponentFixture<NotasDeCreditoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NotasDeCreditoComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NotasDeCreditoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
