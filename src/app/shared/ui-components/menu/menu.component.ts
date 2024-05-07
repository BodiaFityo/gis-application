import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    inject,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CheckboxComponent} from '../checkbox/checkbox.component';
import {Control} from '../../model/control.model';

@Component({
    selector: 'gis-menu',
    standalone: true,
    imports: [CommonModule, CheckboxComponent],
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    @Input() maps!: Control;
    @Input() railsGroup!: Control;
    @Input() vehicle!: Control;
    @Output() onAllChecked = new EventEmitter<Control>();
    @Output() onSetAll = new EventEmitter<{checked: boolean; name: string}>();
    @ViewChild('menu') menuContent!: ElementRef;
    @ViewChild('btn') menuBtn!: ElementRef;

    renderer: Renderer2 = inject(Renderer2);

    showMenuContent = false;

    ngOnInit(): void {
        this.renderer.listen('window', 'click', (e: Event) => {
            const target = e.target as HTMLElement;
            if (
                this.menuContent &&
                !this.menuContent.nativeElement.contains(target) &&
                target.className !== 'menu__btn'
            ) {
                this.showMenuContent = false;
            }
        });
    }

    updateAllChecked(checked: Control): void {
        this.onAllChecked.next(checked);
    }

    setAll(data: {checked: boolean; name: string}): void {
        this.onSetAll.next(data);
    }

    onMenuBtn(): void {
        this.showMenuContent = true;
    }
}
