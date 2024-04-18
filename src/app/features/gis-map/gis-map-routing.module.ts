import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GisMapComponent} from './components/gis-map.component';

const routes: Routes = [
    {
        path: '',
        component: GisMapComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GisMapRoutingModule {}
