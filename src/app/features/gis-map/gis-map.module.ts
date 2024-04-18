import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GisMapComponent} from './components/gis-map.component';
import {GisMapRoutingModule} from './gis-map-routing.module';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';

@NgModule({
    declarations: [GisMapComponent],
    imports: [
        CommonModule,
        GisMapRoutingModule,
        NgxMapboxGLModule.withConfig({
            accessToken:
                'pk.eyJ1IjoiYm9nZGFzNjR1YSIsImEiOiJjbHY1MzBqZHowYng0MnFvYnYwemVyMTUzIn0.0_X2FcWmoEP-kN3sPE1-PA',
        }),
    ],
})
export class GisMapModule {}
