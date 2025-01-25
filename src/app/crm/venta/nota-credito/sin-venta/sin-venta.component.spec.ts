import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinVentaComponent } from './sin-venta.component';

describe('NotaCreditoComponent', () => {
    let component: SinVentaComponent;
    let fixture: ComponentFixture<SinVentaComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SinVentaComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SinVentaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
