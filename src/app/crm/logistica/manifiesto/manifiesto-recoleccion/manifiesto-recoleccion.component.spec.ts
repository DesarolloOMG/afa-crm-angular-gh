import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifiestoRecoleccionComponent } from './manifiesto-recoleccion.component';

describe('ManifiestoRecoleccionComponent', () => {
    let component: ManifiestoRecoleccionComponent;
    let fixture: ComponentFixture<ManifiestoRecoleccionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ManifiestoRecoleccionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ManifiestoRecoleccionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
