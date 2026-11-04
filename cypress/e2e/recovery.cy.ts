describe('Recuperación de contraseña — E1-HU04', () => {
  it('forgot password → mensaje de seguridad por oscuridad — E1-HU04-S01', () => {
    cy.visit('/auth/forgot-password');
    cy.get('input[formControlName="email"]').type('cualquier@correo.com');
    cy.contains('button', /enviar/i).click();
    cy.contains(/recibirás instrucciones/i).should('be.visible');
  });
});
