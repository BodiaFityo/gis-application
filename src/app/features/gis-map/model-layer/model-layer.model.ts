import * as THREE from 'three';

export interface ModelInterface {
    id: string;
    url: string;
    origin: mapboxgl.LngLatLike;
    altitude: number;
    rotateY: number;
    scale: number;
}

export interface ModelLayerInterface {
    id: string;
    type: string;
    renderingMode: string;
    onAdd: (map: mapboxgl.Map, mbxContext: WebGLRenderingContext) => void;
    render: (gl: WebGLRenderingContext, matrix: number[]) => void;
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    map: mapboxgl.Map;
    modelUrl: string;
    modelOrigin: mapboxgl.LngLatLike;
    modelAltitude: number;
}
