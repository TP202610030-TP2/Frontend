describe('Historial — E2-HU05, E2-HU06', () => {
  beforeEach(() => {
    cy.login(Cypress.env('testEmail'), Cypress.env('testPassword'));
    cy.visit('/app/history');
  });

  it('muestra lista de transcripciones o estado vacío — E2-HU05-S01', () => {
    cy.get('app-transcription-card, app-empty-state').should('exist');
  });

  it('click en tarjeta navega al detalle — E2-HU05-S02', () => {
    cy.get('app-transcription-card a').first().click();
    cy.url().should('match', /\/app\/history\/.+/);
    cy.get('app-word-confidence-table, textarea').should('exist');
  });

  it('botón descarga JSON visible en detalle — E2-HU06', () => {
    cy.get('app-transcription-card a').first().click();
    cy.contains('button', 'JSON').should('be.visible');
  });
});
