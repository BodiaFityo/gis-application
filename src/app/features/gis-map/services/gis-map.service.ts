import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GisMapService {
    http = inject(HttpClient);

    getRoute(): Observable<[number[], number[]]> {
        return this.http.get<[number[], number[]]>(
            '/assets/data/gis-data/coord_updated_v2.json'
        );
    }

    getHeatMap(): Observable<[number[], number[]]> {
        return this.http.get<[number[], number[]]>(
            '/assets/data/heat-data/alerts_with_timestamp_and_description.json'
        );
    }
}
