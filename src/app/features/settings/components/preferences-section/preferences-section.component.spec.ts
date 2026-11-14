import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  INTERFACE_LANGUAGES,
  PreferencesSectionComponent,
  comingSoonMessage,
} from './preferences-section.component';

describe('PreferencesSectionComponent', () => {
  let component: PreferencesSectionComponent;
  let fixture:   ComponentFixture<PreferencesSectionComponent>;
  let snackBar:  { open: jest.Mock };

  beforeEach(async () => {
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [PreferencesSectionComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(PreferencesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const change = (value: string) => {
    const source = { writeValue: jest.fn() } as unknown as MatSelect;
    component.onLanguageChange(new MatSelectChange(source, value));
    fixture.detectChanges();
    return source;
  };

  it('el selector está habilitado y lista idiomas disponibles y próximos — CP017', () => {
    const select = fixture.nativeElement.querySelector('mat-select');
    expect(select.getAttribute('aria-disabled')).toBe('false');
    expect(component.languages.some(l => l.available)).toBe(true);
    expect(component.languages.some(l => !l.available)).toBe(true);
    const hint = fixture.nativeElement.querySelector('mat-hint').textContent;
    expect(hint).toContain('Disponible: Español');
    expect(hint).toContain('Próximamente: Quechua');
  });

  it('indica que un idioma no habilitado estará disponible próximamente — CP018', () => {
    const quechua = INTERFACE_LANGUAGES.find(l => !l.available)!;
    const source = change(quechua.code);

    expect(component.selectedLang()).toBe('es');
    expect(source.writeValue).toHaveBeenCalledWith('es');
    expect(component.comingSoonMsg()).toBe(comingSoonMessage(quechua.label));
    expect(snackBar.open).toHaveBeenCalledWith(comingSoonMessage(quechua.label), 'Cerrar', expect.anything());
    const status = fixture.nativeElement.querySelector('[data-testid="lang-coming-soon"]');
    expect(status.textContent).toContain('estará disponible próximamente');
  });

  it('acepta un idioma disponible sin mostrar aviso', () => {
    change('es');
    expect(component.selectedLang()).toBe('es');
    expect(component.comingSoonMsg()).toBeNull();
    expect(snackBar.open).not.toHaveBeenCalled();
  });
});
