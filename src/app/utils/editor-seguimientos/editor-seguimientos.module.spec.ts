import { EditorSeguimientosModule } from './editor-seguimientos.module';

describe('EditorSeguimientosModule', () => {
  let editorSeguimientosModule: EditorSeguimientosModule;

  beforeEach(() => {
    editorSeguimientosModule = new EditorSeguimientosModule();
  });

  it('should create an instance', () => {
    expect(editorSeguimientosModule).toBeTruthy();
  });
});
