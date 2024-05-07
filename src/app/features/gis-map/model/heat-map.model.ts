export interface HeatMap {
    features: Feature[];
    type: string;
}

export interface Feature {
    geometry: Geometry;
    id: string;
    properties: Properties;
    type: string;
}

export interface Geometry {
    coordinates: number[];
    type: string;
}

export interface Properties {
    class: string;
    description: string;
    folderID: null;
    markerColor: string;
    markerRotation: null;
    markerSize: string;
    markerSymbol: string;
    timestamp: string;
    title: string;
    id: number;
}
