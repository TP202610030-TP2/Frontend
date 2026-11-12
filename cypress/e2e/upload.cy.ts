// La interfaz transcribe al seleccionar el archivo (no hay botón "Transcribir").
function selectFile(fixture: string, name: string, type: string): void {
  cy.fixture(fixture, 'binary').then(fileContent => {
    const blob = Cypress.Blob.binaryStringToBlob(fileContent, type);
    const file = new File([blob], name, { type });
    const dt   = new DataTransfer();
    dt.items.add(file);
    cy.get('input[type="file"]').then(input => {
      (input[0] as HTMLInputElement).files = dt.files;
      input[0].dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

describe('Upload de audio — E2-HU01, E2-HU02, E2-HU04, E2-HU06', () => {
  beforeEach(() => {
    cy.login(Cypress.env('testEmail'), Cypress.env('testPassword'));
    cy.visit('/app/upload');
  });

  it('sube un WAV válido y muestra el texto transcrito — E2-HU01', () => {
    selectFile('sample.wav', 'sample.wav', 'audio/wav');
    cy.contains(/transcripción completada/i, { timeout: 30000 }).should('be.visible');
    cy.contains(/texto transcrito/i).should('exist');
  });

  it('archivo con extensión inválida → mensaje de error — E2-HU04', () => {
    selectFile('sample.exe', 'malware.exe', 'application/octet-stream');
    cy.contains(/formato/i).should('be.visible');
  });

  it('botón descargar TXT activa descarga — E2-HU06', () => {
    // Los botones de descarga solo aparecen tras una transcripción exitosa
    selectFile('sample.wav', 'sample.wav', 'audio/wav');
    cy.contains(/transcripción completada/i, { timeout: 30000 }).should('be.visible');
    cy.window().then(win => {
      cy.stub(win.URL, 'createObjectURL').as('createObjectURL').returns('blob:test');
    });
    cy.contains('button', /descargar txt/i).should('be.enabled').click();
    cy.get('@createObjectURL').should('have.been.called');
  });
});
