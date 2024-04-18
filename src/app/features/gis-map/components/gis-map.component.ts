import {Component} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {LngLatLike} from 'mapbox-gl';

@Component({
    selector: 'ga-gis-map',
    templateUrl: './gis-map.component.html',
    styleUrls: ['./gis-map.component.scss'],
})
export class GisMapComponent {
    center: LngLatLike = [12.5657093524933, 55.6725985358769];
    zoom: [number] = [15];
    map!: mapboxgl.Map;
    labelLayerId: string | undefined;

    onLoad(map: mapboxgl.Map) {
        this.map = map;
        const layers = map.getStyle().layers;
        if (!layers) {
            return;
        }
        this.labelLayerId = this.getLabelLayerId(layers);
        this.map.addControl(new mapboxgl.NavigationControl());
    }

    private getLabelLayerId(layers: mapboxgl.AnyLayer[]) {
        for (const layer of layers) {
            if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                return layer.id;
            }
        }
        return;
    }
}
