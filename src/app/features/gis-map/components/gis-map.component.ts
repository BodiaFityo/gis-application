import {Component, ElementRef, ViewChild, inject} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {LngLatLike} from 'mapbox-gl';
import {GisMapService} from '../services/gis-map.service';
import {combineLatest, tap} from 'rxjs';
import {Feature, HeatMap} from '../model/heat-map.model';
import {Control} from 'src/app/shared/model/control.model';

@Component({
    selector: 'gis-map',
    templateUrl: './gis-map.component.html',
    styleUrls: ['./gis-map.component.scss'],
})
export class GisMapComponent {
    @ViewChild('accordion') accordionTemplate!: ElementRef<HTMLElement>;

    gisService = inject(GisMapService);
    $getRoute = this.gisService.getRoute().pipe(
        tap((data) => {
            this.dataRout = data;
        })
    );
    $getHeatMap = this.gisService.getHeatMap().pipe(
        tap((data: unknown) => {
            this.heatData = data as HeatMap;
        })
    );
    $data = combineLatest([this.$getRoute, this.$getHeatMap]);

    dataRout: [number[], number[]] = [[], []];
    heatData!: HeatMap;

    center: LngLatLike = [12.5657093524933, 55.6725985358769];
    zoom: [number] = [11];
    map!: mapboxgl.Map;
    labelLayerId: string | undefined;
    intervalId!: unknown;
    index = 0;
    markerA!: mapboxgl.Marker;
    markerTunel!: mapboxgl.Marker;
    popup!: mapboxgl.Popup;
    groupAlerts!: Feature[];
    expandedIndex = 0;

    maps: Control = {
        name: 'Maps',
        checked: false,

        subControl: [{name: 'Heat', checked: false}],
    };
    railsGroup: Control = {
        name: 'Rails Group',
        checked: false,
        subControl: [{name: 'DSB', checked: true}],
    };

    vehicle: Control = {
        name: 'Vehicle',
        checked: false,
        subControl: [{name: 'Train', checked: true}],
    };

    onLoad(map: mapboxgl.Map) {
        this.map = map;
        const layers = map.getStyle().layers;
        if (!layers) {
            return;
        }
        this.labelLayerId = this.getLabelLayerId(layers);
        this.addNavigationBar();
        this.addRoute();

        this.addHeatMap();

        this.intervalId = setInterval(
            this.updateMarkerPosition.bind(this),
            1000
        );
        this.popup = new mapboxgl.Popup({offset: 20, maxWidth: '415px'});

        this.markerA = new mapboxgl.Marker({
            element: this.createMarkerElement('round-train.png'),
            scale: 1,
        })
            .setLngLat([12.5657093524933, 55.6725985358769])
            .setPopup(this.popup)
            .addTo(map);

        this.markerTunel = new mapboxgl.Marker({
            element: this.createMarkerElement('tunel-alarm.png'),
            scale: 1,
        })
            .setLngLat([12.5463008880615, 55.6428495199124])
            .addTo(map);

        this.markerTunel.remove();

        this.markerTunel.getElement().addEventListener('click', () => {
            // Create a popup

            const lngLat = this.markerTunel.getLngLat();

            const heatmapSource = this.map.getSource('alerts') as any;

            // Get the features from the heatmap data source
            const features = heatmapSource._data.features;

            // Access the nativeElement property directly

            // Iterate through the features to find the closest one to the marker
            this.groupAlerts = features.filter((feature: Feature) => {
                const [x] = feature.geometry.coordinates;
                return x === lngLat.lng ? feature : null;
            });

            const popup = new mapboxgl.Popup({
                offset: 20,
                maxWidth: '640px',
            })
                .setLngLat(this.markerTunel.getLngLat())
                .setDOMContent(this.accordionTemplate.nativeElement);
            this.markerTunel.setPopup(popup);
        });

        this.hideShowLayer(false, 'earthquakes-point');
        this.hideShowLayer(false, 'earthquakes-heat');

        this.map.on('click', (e) => {
            const features = this.map.queryRenderedFeatures(e.point, {
                layers: ['earthquakes-point'],
            });

            if (features.length > 0) {
                const feature = features[0] as mapboxgl.MapboxGeoJSONFeature;
                const geometry = feature.geometry;

                if (geometry.type === 'Point') {
                    const coordinates = geometry.coordinates;
                    const properties: any = feature.properties;
                    const [lng, lat] = coordinates;
                    if (properties.id === 1) {
                        return;
                    }

                    // Create a popup
                    const popup = new mapboxgl.Popup({
                        offset: 20,
                        maxWidth: '415px',
                    }).setLngLat(coordinates as mapboxgl.LngLatLike);
                    popup
                        .setHTML(
                            `
                            <div class="popup">

                            <div class="popup__header header">

                                <span class="header__title">${properties.title}</span>
                            </div>

                            <div class="popup__row popup__row--light">
                                <span>Description</span><span>${properties.description}</span>
                            </div>

                            <div class="popup__row">
                                <span>Time</span><span>${properties.timestamp}</span>
                            </div>

                            <div class="popup__row popup__row--light">
                                <span>Longitude:</span><span>${lng}</span>
                            </div>
                            <div class="popup__row ">
                                <span>Latitude:</span><span>${lat}</span>
                            </div>
                            <div class="popup__row">

                        </div>
                    `
                        )
                        .addTo(this.map);
                }
            }
        });
    }

    private addNavigationBar(): void {
        this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
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
                'line-color': '#80CBC4',
                'line-width': 5,
            },
        });
    }

    private addHeatMap(): void {
        this.map.addSource('alerts', {
            type: 'geojson',
            data: this.heatData as any,
        });
        this.map.addLayer({
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
        });

        this.map.addLayer({
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
                    ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50],
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
        });
    }

    private getLabelLayerId(layers: mapboxgl.AnyLayer[]) {
        for (const layer of layers) {
            if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                return layer.id;
            }
        }
        return;
    }

    hideShowLayer(show: boolean, id: string): void {
        this.map.setLayoutProperty(id, 'visibility', 'none');

        if (show) {
            this.map.setLayoutProperty(id, 'visibility', 'visible');
        }
    }

    onAllChecked(control: Control) {
        switch (control.name) {
            case 'DSB':
                this.hideShowLayer(control.checked, 'line-gradient');
                break;
            case 'Heat':
                this.hideShowLayer(control.checked, 'earthquakes-point');
                this.hideShowLayer(control.checked, 'earthquakes-heat');
                control.checked
                    ? this.markerTunel.addTo(this.map)
                    : this.markerTunel.remove();
                break;
            case 'Train':
                control.checked
                    ? this.markerA.addTo(this.map)
                    : this.markerA.remove();
                break;
        }
    }

    onSetAll(data: {checked: boolean; name: string}) {
        switch (data.name) {
            case 'Maps':
                this.hideShowLayer(data.checked, 'earthquakes-point');
                this.hideShowLayer(data.checked, 'earthquakes-heat');
                data.checked
                    ? this.markerTunel.addTo(this.map)
                    : this.markerTunel.remove();
                break;
            case 'Rails Group':
                this.hideShowLayer(data.checked, 'line-gradient');

                break;
            case 'Vehicle':
                data.checked
                    ? this.markerA.addTo(this.map)
                    : this.markerA.remove();
                break;
        }
    }

    updateMarkerPosition() {
        if (this.index < this.dataRout.length) {
            const lngLat = this.dataRout[this.index];
            const [lng, Lat] = lngLat;

            this.markerA.setLngLat(lngLat as mapboxgl.LngLatLike);
            this.popup.setHTML(
                `
                <div class="popup">
                <div class="popup__header header">
                    <div class="header__img"></div>
                    <span  class="header__title">Train Name</span>
                </div>
                <div class="popup__row popup__row--light">
                    <span>id:</span><span>TMS-Train-12345</span>
                </div>
                <div class="popup__row">
                    <span>Longitude:</span><span>${lng}</span>
                </div>
                <div class="popup__row popup__row--light">
                    <span>Latitude:</span><span>${Lat}</span>
                </div>
                <div class="popup__row">
                    <span>Begin OP:</span><span>-1</span>
                </div>
                <div class="popup__row popup__row--light">
                    <span>Location id:</span><span>123</span>
                </div>
                <div class="popup__row">
                    <span>Long Name:</span><span>Long name</span>
                </div>
                <div class="popup__row popup__row--light">
                    <span>Permanent id:</span><span>123456</span>
                </div>
                <div class="popup__row">
                    <span>Source System Name:</span><span>Some Name</span>
                </div>
                <div class="popup__row popup__row--light">
                    <span>Train Number:</span><span>12345</span>
                </div>
            </div>
        `
            );

            this.index++; // Increment index for the next position
        } else {
            clearInterval(this.intervalId as number); // Stop the interval if all positions have been processed
        }
    }
    createMarkerElement(url: string) {
        const element = document.createElement('div');
        const img = document.createElement('img');
        img.src = `assets/data/images/${url}`;

        img.width = 32;
        img.height = 32;

        element.append(img);

        return element;
    }
}
