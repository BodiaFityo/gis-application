import {Component, inject} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {LngLatLike} from 'mapbox-gl';
import ModelLayer from '../model-layer/model-layer';
import {GisMapService} from '../services/gis-map.service';
import {tap} from 'rxjs';

@Component({
    selector: 'ga-gis-map',
    templateUrl: './gis-map.component.html',
    styleUrls: ['./gis-map.component.scss'],
})
export class GisMapComponent {
    $route = inject(GisMapService)
        .getRoute()
        .pipe(
            tap((data) => {
                this.dataRout = data;
            })
        );
    dataRout: [number[], number[]] = [[], []];

    center: LngLatLike = [12.5657093524933, 55.6725985358769];
    zoom: [number] = [11];
    map!: mapboxgl.Map;
    labelLayerId: string | undefined;

    onLoad(map: mapboxgl.Map) {
        this.map = map;
        const layers = map.getStyle().layers;
        if (!layers) {
            return;
        }
        this.labelLayerId = this.getLabelLayerId(layers);
        this.addNavigationBar();
        this.addRoute();

        map.addLayer(
            new ModelLayer({
                id: 'layer-3d',
                url: 'assets/models/futuristic_building.glb',
                origin: [12.5657093524933, 55.6725985358769],
                altitude: 26.3,
                rotateY: 5.3,
                scale: 34.8,
            })
        );

        this.addHeatMap();

        this.hideShowLayer(false, 'earthquakes-point');
        this.hideShowLayer(false, 'earthquakes-heat');
    }

    private addNavigationBar(): void {
        this.map.addControl(new mapboxgl.NavigationControl());
    }

    private addRoute(): void {
        // Add source for the route geometry
        this.map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: this.dataRout,
                },
            },
            lineMetrics: true,
        });
        // Add layer to visualize the route
        this.map.addLayer({
            id: 'line-gradient',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-color': '#BF93E4',
                'line-width': 5,
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,
                    '#ffff00', // Start color
                    0.9,
                    '#007FFF',
                    1,
                    '#007FFF', // End color
                ],
            },
        });
    }

    private addHeatMap(): void {
        this.map.addSource('alerts', {
            type: 'geojson',
            data: 'assets/data/heat-data/map_Items.json',
        });
        this.map.addLayer(
            {
                id: 'earthquakes-heat',
                type: 'heatmap',
                source: 'alerts',
                maxzoom: 9,
                paint: {
                    // Increase the heatmap weight based on frequency and property magnitude
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'mag'],
                        0,
                        0,
                        6,
                        1,
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        1,
                        9,
                        3,
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0,
                        'rgba(33,102,172,0)',
                        0.2,
                        'rgb(103,169,207)',
                        0.4,
                        'rgb(209,229,240)',
                        0.6,
                        'rgb(253,219,199)',
                        0.8,
                        'rgb(239,138,98)',
                        1,
                        'rgb(178,24,43)',
                    ],
                    // Adjust the heatmap radius by zoom level
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        2,
                        9,
                        20,
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        7,
                        1,
                        9,
                        0,
                    ],
                },
            },
            'waterway-label'
        );

        this.map.addLayer(
            {
                id: 'earthquakes-point',
                type: 'circle',
                source: 'alerts',
                minzoom: 7,
                paint: {
                    // Size circle radius by earthquake magnitude and zoom level
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        7,
                        ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
                        16,
                        [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            1,
                            5,
                            6,
                            50,
                        ],
                    ],
                    // Color circle by earthquake magnitude
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'mag'],
                        1,
                        'rgba(33,102,172,0)',
                        2,
                        'rgb(103,169,207)',
                        3,
                        'rgb(209,229,240)',
                        4,
                        'rgb(253,219,199)',
                        5,
                        'rgb(239,138,98)',
                        6,
                        'rgb(178,24,43)',
                    ],
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    // Transition from heatmap to circle layer by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        7,
                        0,
                        8,
                        1,
                    ],
                },
            },
            'waterway-label'
        );
    }

    private getLabelLayerId(layers: mapboxgl.AnyLayer[]) {
        for (const layer of layers) {
            if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                return layer.id;
            }
        }
        return;
    }

    gisMapToggle(event: Event): void {
        const {checked} = event.currentTarget as HTMLInputElement;
        this.hideShowLayer(checked, 'line-gradient');
    }

    heatMapToggle(event: Event): void {
        const {checked} = event.currentTarget as HTMLInputElement;

        this.hideShowLayer(checked, 'earthquakes-point');
        this.hideShowLayer(checked, 'earthquakes-heat');
    }

    hideShowLayer(show: boolean, id: string): void {
        this.map.setLayoutProperty(id, 'visibility', 'none');

        if (show) {
            this.map.setLayoutProperty(id, 'visibility', 'visible');
        }
    }
}
