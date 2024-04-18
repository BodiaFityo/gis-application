import {Route} from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadChildren: () =>
            import('./features/gis-map/gis-map.module').then(
                (m) => m.GisMapModule
            ),
    },
];
