describe('Configuración — E1-HU03', () => {
  beforeEach(() => {
    cy.login(Cypress.env('testEmail'), Cypress.env('testPassword'));
    cy.visit('/app/settings');
  });

  it('muestra datos del perfil precargados — E1-HU03-S01', () => {
    cy.get('input[formControlName="email"]').should('not.have.value', '');
  });

  it('actualizar nombre guarda correctamente — E1-HU03-S02', () => {
    cy.get('input[formControlName="fullName"]').clear().type('Nombre Actualizado');
    cy.contains('button', /guardar/i).click();
    cy.contains(/actualizado correctamente/i).should('be.visible');
  });
});
