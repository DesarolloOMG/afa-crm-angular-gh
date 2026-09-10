import 'zone.js/dist/zone-testing';
import {getTestBed} from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
require('./app/crm/auth/login/login-totp.component.spec');
require('./app/crm/auth/forgot/forgot-totp.component.spec');
