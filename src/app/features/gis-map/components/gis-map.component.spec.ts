import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GisMapComponent} from './gis-map.component';

describe('GisMapComponent', () => {
    let component: GisMapComponent;
    let fixture: ComponentFixture<GisMapComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GisMapComponent],
        });
        fixture = TestBed.createComponent(GisMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
