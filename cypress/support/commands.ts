declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/v1/auth/login`, { email, password })
    .then(res => {
      localStorage.setItem('asr_token', res.body.token);
    });
  cy.visit('/app/dashboard');
});
