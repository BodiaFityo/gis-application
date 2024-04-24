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
                'pk.eyJ1IjoidmxhZGFiIiwiYSI6ImNsdjU4MTg1ZDAwNTMya28wZnM4eG5ucWYifQ.t5wdkT-NP8lqJnM3TMiYKg',
        }),
    ],
})
export class GisMapModule {}
