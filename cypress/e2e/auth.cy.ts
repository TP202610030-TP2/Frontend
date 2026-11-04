describe('Autenticación — E1-HU01, E1-HU02, E1-HU05', () => {
  const email    = `test+${Date.now()}@example.com`;
  const password = 'Test1234!';

  it('registro completo → login → dashboard — E1-HU01, E1-HU02', () => {
    cy.visit('/auth/register');
    cy.get('input[formControlName="fullName"]').type('Test User');
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('input[formControlName="confirmPassword"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/auth/login');

    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/app/dashboard');
  });

  it('login con credenciales incorrectas → mensaje de error — E1-HU02', () => {
    cy.visit('/auth/login');
    cy.get('input[formControlName="email"]').type('wrong@example.com');
    cy.get('input[formControlName="password"]').type('WrongPass123');
    cy.get('button[type="submit"]').click();
    cy.contains(/incorrectos/i).should('be.visible');
  });

  it('logout desde dashboard — E1-HU05', () => {
    cy.login(email, password);
    cy.contains('button', /cerrar sesión/i).click({ force: true });
    cy.contains('button', /cerrar sesión/i).last().click();
    cy.url().should('include', '/auth/login');
  });
});
