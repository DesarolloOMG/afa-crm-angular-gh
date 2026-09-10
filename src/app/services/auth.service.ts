import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthService {
    constructor(public jwtHelper: JwtHelperService) {}

    /** Lee el token del storage y lo normaliza (Angular 6 friendly) */
    private getRawToken(): string {
        var t = localStorage.getItem('crm_access_token');

        if (!t) {
            return '';
        }

        var token = (t + '').trim();

        if (!token || token === 'null' || token === 'undefined') {
            return '';
        }

        // Si por error guardaste "Bearer eyJ..."
        if (token.indexOf('Bearer ') === 0) {
            token = token.replace('Bearer ', '').trim();
        }

        return token;
    }

    /** Valida formato JWT: 3 partes separadas por punto */
    private isJwt(token: string): boolean {
        if (!token) return false;
        return token.split('.').length === 3;
    }

    public isAuthenticated(): boolean {
        var token = this.getRawToken();
        if (!this.isJwt(token)) {
            return false;
        }

        return !this.jwtHelper.isTokenExpired(token);
    }

    public userData(): any {
        var token = this.getRawToken();
        if (!this.isJwt(token)) {
            return null;
        }

        try {
            return this.jwtHelper.decodeToken(token);
        } catch (e) {
            return null;
        }
    }

    public expirationDate(): Date {
        var token = this.getRawToken();
        if (!this.isJwt(token)) {
            return null;
        }

        try {
            return this.jwtHelper.getTokenExpirationDate(token);
        } catch (e) {
            return null;
        }
    }

    isUserAdmin(): boolean {
        var payload = this.userData();
        if (!payload) return false;

        // Tu código original asume que payload.sub es un JSON string
        var sub = payload.sub;
        if (!sub) return false;

        var userData: any = null;

        try {
            // si sub es string JSON => parse
            if (typeof sub === 'string') {
                userData = JSON.parse(sub);
            } else {
                // por si algún día sub ya viene como objeto
                userData = sub;
            }
        } catch (e) {
            return false;
        }

        // subniveles puede no existir
        var subniveles = (userData && userData.subniveles) ? userData.subniveles : {};
        var niveles = Object.keys(subniveles);

        // Angular 6: mejor indexOf para evitar temas de polyfill
        return niveles.indexOf('6') >= 0;
    }
}
