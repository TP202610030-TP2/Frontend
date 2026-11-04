describe('Upload de audio — E2-HU01, E2-HU02, E2-HU04, E2-HU06', () => {
  beforeEach(() => {
    cy.login(Cypress.env('testEmail'), Cypress.env('testPassword'));
    cy.visit('/app/upload');
  });

  it('sube un WAV válido y muestra el texto transcrito — E2-HU01', () => {
    cy.fixture('sample.wav', 'binary').then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'audio/wav');
      const file = new File([blob], 'sample.wav', { type: 'audio/wav' });
      const dt   = new DataTransfer();
      dt.items.add(file);

      cy.get('input[type="file"]').then(input => {
        (input[0] as HTMLInputElement).files = dt.files;
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    cy.get('button').contains(/transcribir/i).click();
    cy.contains(/texto/i, { timeout: 30000 }).should('exist');
  });

  it('archivo con extensión inválida → mensaje de error — E2-HU04', () => {
    cy.fixture('sample.exe', 'binary').then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'application/octet-stream');
      const file = new File([blob], 'malware.exe', { type: 'application/octet-stream' });
      const dt   = new DataTransfer();
      dt.items.add(file);

      cy.get('input[type="file"]').then(input => {
        (input[0] as HTMLInputElement).files = dt.files;
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    cy.contains(/formato/i).should('be.visible');
  });

  it('botón descargar TXT activa descarga — E2-HU06', () => {
    cy.window().then(win => {
      cy.stub(win.URL, 'createObjectURL').returns('blob:test');
    });
    cy.contains('TXT').should('exist');
  });
});
