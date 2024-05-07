import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgFor} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Control} from '../../model/control.model';

@Component({
    selector: 'gis-checkbox',
    standalone: true,
    imports: [CommonModule, MatCheckboxModule, NgFor, FormsModule],
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent {
    @Input() control!: Control;
    @Output() onAllChecked = new EventEmitter<Control>();
    @Output() onSetAll = new EventEmitter<{checked: boolean; name: string}>();

    allChecked: boolean = false;

    updateAllChecked(checked: Control) {
        this.allChecked =
            this.control.subControl != null &&
            this.control.subControl.every((t) => t.checked);

        this.onAllChecked.next(checked);
    }

    someComplete(): boolean {
        if (this.control.subControl == null) {
            return false;
        }
        return (
            this.control.subControl.filter((t) => t.checked).length > 0 &&
            !this.allChecked
        );
    }

    setAll(checkbox: boolean, task: Control) {
        this.allChecked = checkbox;
        if (this.control.subControl == null) {
            return;
        }
        this.control.subControl.forEach((t) => (t.checked = checkbox));
        this.onSetAll.next({checked: this.allChecked, name: task.name});
    }
}
