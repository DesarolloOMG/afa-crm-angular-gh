import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {LoaderService} from '../services/loader.service';
import {Injectable} from '@angular/core';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class LoaderInterceptorService implements HttpInterceptor {

    constructor(private loaderService: LoaderService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const is_notificacion = req.url.includes('general/notificacion/data');
        const is_dropbox = req.url.includes('dropboxapi.com');
        const is_mercadolibre = req.url.includes('api.mercadolibre.com');


        if (!is_notificacion) {
            this.showLoader();
        }

        if (!is_dropbox && !is_mercadolibre) {
            req = req.clone({
                setParams: {
                    token: window.localStorage.getItem('crm_access_token')
                }
            });
        }

        return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if (!is_notificacion) {
                        this.onEnd();
                    }
                }
            },
            (err: any) => {
                if (!is_notificacion) {
                    this.onEnd();
                }
            }));
    }

    private onEnd(): void {
        this.hideLoader();
    }

    private showLoader(): void {
        const elems = document.getElementsByClassName('http-disabled');

        for (let i = 0; i < elems.length; i++) {
            elems[i]['disabled'] = true;
        }

        this.loaderService.show();
    }

    private hideLoader(): void {
        const elems = document.getElementsByClassName('http-disabled');

        for (let i = 0; i < elems.length; i++) {
            elems[i]['disabled'] = false;
        }

        this.loaderService.hide();
    }
}
