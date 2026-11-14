describe('Recuperación de contraseña — E1-HU04', () => {
  it('correo registrado → confirma el envío de instrucciones — CP007', () => {
    cy.intercept('POST', '**/api/v1/auth/password-recovery', { statusCode: 204 }).as('recovery');
    cy.visit('/auth/forgot-password');
    cy.get('input[formControlName="email"]').type('usuario@correo.com');
    cy.contains('button', /enviar/i).click();
    cy.wait('@recovery');
    cy.get('[data-testid="recovery-success"]')
      .should('be.visible')
      .and('contain', 'Te enviamos las instrucciones de recuperación a usuario@correo.com');
  });

  it('correo inexistente → informa que el usuario no fue encontrado — CP008', () => {
    cy.intercept('POST', '**/api/v1/auth/password-recovery', {
      statusCode: 404,
      body: { detail: { errorCode: 'RESOURCE_001', message: 'No user is registered with this email' } },
    }).as('recovery');
    cy.visit('/auth/forgot-password');
    cy.get('input[formControlName="email"]').type('noexiste@correo.com');
    cy.contains('button', /enviar/i).click();
    cy.wait('@recovery');
    cy.get('[data-testid="recovery-error"]')
      .should('be.visible')
      .and('contain', 'No se encontró ningún usuario registrado');
  });
});
