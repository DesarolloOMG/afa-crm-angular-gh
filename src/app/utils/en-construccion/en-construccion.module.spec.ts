import { EnConstruccionModule } from './en-construccion.module';

describe('EnConstruccionModule', () => {
    let enConstruccionModule: EnConstruccionModule;

    beforeEach(() => {
        enConstruccionModule = new EnConstruccionModule();
    });

    it('should create an instance', () => {
        expect(enConstruccionModule).toBeTruthy();
    });
});
