import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GisMapComponent} from './components/gis-map.component';
import {GisMapRoutingModule} from './gis-map-routing.module';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import {MenuComponent} from 'src/app/shared/ui-components/menu/menu.component';
import {CdkAccordionModule} from '@angular/cdk/accordion';

@NgModule({
    declarations: [GisMapComponent],
    imports: [
        CommonModule,
        CdkAccordionModule,
        GisMapRoutingModule,
        NgxMapboxGLModule.withConfig({
            accessToken:
                'pk.eyJ1IjoidmxhZGFiIiwiYSI6ImNsdjU4MTg1ZDAwNTMya28wZnM4eG5ucWYifQ.t5wdkT-NP8lqJnM3TMiYKg',
        }),
        MenuComponent,
    ],
})
export class GisMapModule {}
