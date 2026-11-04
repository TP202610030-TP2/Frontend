import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validador de grupo: marca confirmPassword con error `passwordMatch` si no coinciden */
export function passwordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pw      = group.get(passwordKey);
    const confirm = group.get(confirmKey);
    if (!pw || !confirm) return null;

    if (pw.value !== confirm.value) {
      confirm.setErrors({ ...(confirm.errors ?? {}), passwordMatch: true });
      return { passwordMatch: true };
    }

    if (confirm.hasError('passwordMatch')) {
      const errors = { ...confirm.errors };
      delete errors['passwordMatch'];
      confirm.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  };
}
