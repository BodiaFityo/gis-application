import * as mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

import {ModelInterface, ModelLayerInterface} from './model-layer.model';

class ModelLayer implements ModelLayerInterface {
    modelTransform: {
        translateX: number;
        translateY: number;
        translateZ: number;
        rotateX: number;
        rotateY: number;
        rotateZ: number;
        scale: number;
    };
    constructor(options: ModelInterface) {
        this.modelUrl = options.url;
        this.modelOrigin = options.origin;
        this.modelAltitude = options.altitude;
        this.id = options.id;
        this.type = 'custom';
        this.renderingMode = '3d';
        const rotate = [Math.PI / 2, options.rotateY, 0];
        const scale = options.scale * 1e-8;
        const mercator = mapboxgl.MercatorCoordinate.fromLngLat(
            this.modelOrigin,
            this.modelAltitude
        );

        this.modelTransform = {
            translateX: mercator.x,
            translateY: mercator.y,
            translateZ: mercator.z as number,
            rotateX: rotate[0],
            rotateY: rotate[1],
            rotateZ: rotate[2],
            scale,
        };
    }
    id: string;
    type: 'custom';
    renderingMode: '3d';
    camera!: THREE.Camera;
    scene!: THREE.Scene;
    renderer!: THREE.WebGLRenderer;
    map!: mapboxgl.Map;
    modelUrl: string;
    modelOrigin: mapboxgl.LngLatLike;
    modelAltitude: number;

    onAdd(map: mapboxgl.Map, mbxContext: WebGLRenderingContext) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        this.scene.add(ambientLight);

        const loader = new GLTFLoader();
        loader.load(this.modelUrl, ({scene}) => {
            this.scene.add(scene);
        });
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: mbxContext,
            antialias: true,
        });
        this.renderer.autoClear = false;

        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2;
    }

    render(gl: WebGLRenderingContext, matrix: number[]) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            this.modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            this.modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            this.modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
            .makeTranslation(
                this.modelTransform.translateX,
                this.modelTransform.translateY,
                this.modelTransform.translateZ
            )
            .scale(
                new THREE.Vector3(
                    this.modelTransform.scale,
                    -this.modelTransform.scale,
                    this.modelTransform.scale
                )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}

export default ModelLayer;
