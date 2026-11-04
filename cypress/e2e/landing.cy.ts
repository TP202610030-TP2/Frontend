describe('Landing page', () => {
  it('carga la landing con el CTA de registro', () => {
    cy.visit('/');
    cy.contains('Transcripción').should('be.visible');
    cy.get('a[href*="register"], button').contains(/registr/i).should('exist');
  });

  it('CTA navega a la página de registro', () => {
    cy.visit('/');
    cy.get('a[href*="register"]').first().click();
    cy.url().should('include', '/auth/register');
  });
});
