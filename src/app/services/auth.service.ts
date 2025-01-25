import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthService {
    constructor(public jwtHelper: JwtHelperService) {}
    // ...
    public isAuthenticated(): boolean {
        const token = localStorage.getItem('crm_access_token');
        // Check whether the token is expired and return
        // true or false
        return !this.jwtHelper.isTokenExpired(token);
    }

    isUserAdmin(): boolean {
        const userData = JSON.parse(this.userData().sub);

        const niveles = Object.keys(userData.subniveles);

        return niveles.indexOf('6') >= 0;
    }

    public userData() {
        const token = localStorage.getItem('crm_access_token');

        return this.jwtHelper.decodeToken(token);
    }

    public expirationDate() {
        const token = localStorage.getItem('crm_access_token');

        return this.jwtHelper.getTokenExpirationDate(token);
    }
}
