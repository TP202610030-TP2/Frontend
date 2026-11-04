describe('API Docs — E3-HU02, E3-HU03', () => {
  beforeEach(() => {
    cy.login(Cypress.env('testEmail'), Cypress.env('testPassword'));
    cy.visit('/app/docs');
  });

  it('iframe con Swagger UI existe — E3-HU02-S01', () => {
    cy.get('iframe[title="Documentación API ASR Quechua"]').should('exist');
  });

  it('botón copiar token es visible — E3-HU02-S03', () => {
    cy.contains('button', /copiar/i).should('be.visible');
  });

  it('panel informativo muestra Versión: v1 — E3-HU06', () => {
    cy.contains('v1').should('be.visible');
  });
});
