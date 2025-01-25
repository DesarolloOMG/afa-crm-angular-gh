import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';
import { UiSwitchModule } from 'ng2-ui-switch';
import {
    PERFECT_SCROLLBAR_CONFIG,
    PerfectScrollbarConfigInterface,
    PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';

import { AppComponent } from './app.component';
import { AdminComponent } from './layout/admin/admin.component';
import { AuthComponent } from './layout/auth/auth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuItems } from './layout/menu-items';
import { BreadcrumbsComponent } from './layout/admin/breadcrumbs/breadcrumbs.component';

import { UserService } from './GoogleApisService';
import { SheetResource } from './SheetResource';

import { LoaderInterceptorService } from './services/loader-interceptor.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { LoaderComponent } from './loader/loader.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { TitleComponent } from './layout/admin/title/title.component';
import { AccordionAnchorDirective } from './shared/accordion/accordionanchor.directive';
import { AccordionLinkDirective } from './shared/accordion/accordionlink.directive';
import { AccordionDirective } from './shared/accordion/accordion.directive';
import { SnowComponent } from './layout/snow/snow.component';
import { EditorSeguimientosModule } from './utils/editor-seguimientos/editor-seguimientos.module';
import { EnConstruccionModule } from './utils/en-construccion/en-construccion.module';

export function tokenGetter() {
    return localStorage.getItem('crm_access_token');
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
};

@NgModule({
    declarations: [
        AppComponent,
        AdminComponent,
        AuthComponent,
        BreadcrumbsComponent,
        LoaderComponent,
        SpinnerComponent,
        TitleComponent,
        AccordionAnchorDirective,
        AccordionLinkDirective,
        AccordionDirective,
        SnowComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule.forRoot(),
        ClickOutsideModule,
        PerfectScrollbarModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                whitelistedDomains: ['example.com'],
                blacklistedRoutes: ['example.com/examplebadroute/'],
            },
        }),
        UiSwitchModule,
        TextMaskModule,
        EditorSeguimientosModule,
        EnConstruccionModule,
    ],
    providers: [
        MenuItems,
        AuthGuardService,
        AuthService,
        UserService,
        SheetResource,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoaderInterceptorService,
            multi: true,
        },
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
