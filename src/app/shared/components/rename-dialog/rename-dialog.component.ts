import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface RenameDialogData {
  currentName: string;
}

@Component({
  selector: 'app-rename-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Renombrar transcripción</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Nombre del archivo</mat-label>
        <input matInput [formControl]="nameControl" maxlength="255" cdkFocusInitial>
        @if (nameControl.hasError('required')) {
          <mat-error>El nombre no puede estar vacío.</mat-error>
        }
        @if (nameControl.hasError('maxlength')) {
          <mat-error>El nombre no puede superar 255 caracteres.</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="nameControl.invalid" (click)="onConfirm()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
})
export class RenameDialogComponent {
  data = inject<RenameDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RenameDialogComponent>);

  readonly nameControl = new FormControl(this.data.currentName, [
    Validators.required,
    Validators.maxLength(255),
  ]);

  onConfirm(): void {
    if (this.nameControl.invalid) return;
    const value = this.nameControl.value?.trim();
    if (!value) return;
    this.dialogRef.close(value);
  }
}
