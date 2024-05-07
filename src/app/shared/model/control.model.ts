export interface Control {
    name: string;
    checked: boolean;
    subControl?: Control[];
}
