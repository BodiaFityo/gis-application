import {Route} from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadChildren: () =>
            import('./features/gis-map/gis-map.routes').then((m) => m.gisMap),
    },
];
