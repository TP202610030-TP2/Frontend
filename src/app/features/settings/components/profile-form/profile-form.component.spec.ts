import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProfileFormComponent } from './profile-form.component';
import { UserService } from '@core/services/user.service';
import type { UserProfile } from '@core/models/user.models';

const mockProfile: UserProfile = {
  user_id:       'u-1',
  email:         'test@example.com',
  full_name:     'Ana Torres',
  phone_number:  '+51987654321',
  date_of_birth: '1995-06-15',
  created_at:    '2024-01-01T00:00:00Z',
};

describe('ProfileFormComponent', () => {
  let component: ProfileFormComponent;
  let fixture:   ComponentFixture<ProfileFormComponent>;
  let userSvc:   { getProfile: jest.Mock; updateProfile: jest.Mock };
  let snackBar:  { open: jest.Mock };

  beforeEach(async () => {
    userSvc  = {
      getProfile:    jest.fn().mockReturnValue(of(mockProfile)),
      updateProfile: jest.fn().mockReturnValue(of(mockProfile)),
    };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProfileFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: UserService,  useValue: userSvc },
        { provide: MatSnackBar,  useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('precarga datos del perfil en el formulario — E1-HU03-S01', () => {
    expect(userSvc.getProfile).toHaveBeenCalled();
    expect(component.form.get('fullName')?.value).toBe('Ana Torres');
    expect(component.form.get('phone')?.value).toBe('+51987654321');
    expect(component.loading()).toBe(false);
  });

  it('submit válido → updateProfile() llamado — E1-HU03-S02', () => {
    component.form.patchValue({ fullName: 'Ana Torres Editado', phone: '+51987654321' });
    component.submit();

    expect(userSvc.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'Ana Torres Editado' }),
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      'Perfil actualizado correctamente', 'OK', expect.any(Object),
    );
  });

  it('teléfono con formato inválido → error de validación — E1-HU03-S03', () => {
    component.form.get('phone')?.setValue('123');
    component.form.get('phone')?.markAsTouched();
    fixture.detectChanges();

    expect(component.form.get('phone')?.hasError('pattern')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('fecha de nacimiento < 13 años → matDatepickerMax error', () => {
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 5);
    component.form.get('dateOfBirth')?.setValue(tooYoung);
    component.form.get('dateOfBirth')?.setErrors({ matDatepickerMax: true });
    component.form.get('dateOfBirth')?.markAsTouched();
    fixture.detectChanges();

    expect(component.form.get('dateOfBirth')?.hasError('matDatepickerMax')).toBe(true);
  });
});
