import {
    animate,
    AUTO_STYLE,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { backend_url } from './../../../environments/environment';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from './../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { MenuItems } from '../menu-items';
import { Router } from '@angular/router';
import * as Pusher from 'pusher-js';
import swal from 'sweetalert2';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    animations: [
        trigger('notificationBottom', [
            state(
                'an-off, void',
                style({
                    overflow: 'hidden',
                    height: '0px',
                })
            ),
            state(
                'an-animate',
                style({
                    overflow: 'hidden',
                    height: AUTO_STYLE,
                })
            ),
            transition('an-off <=> an-animate', [animate('400ms ease-in-out')]),
        ]),
        trigger('slideInOut', [
            state(
                'in',
                style({
                    width: '300px',
                    // transform: 'translate3d(0, 0, 0)'
                })
            ),
            state(
                'out',
                style({
                    width: '0',
                    // transform: 'translate3d(100%, 0, 0)'
                })
            ),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out')),
        ]),
        trigger('mobileHeaderNavRight', [
            state(
                'nav-off, void',
                style({
                    overflow: 'hidden',
                    height: '0px',
                })
            ),
            state(
                'nav-on',
                style({
                    height: AUTO_STYLE,
                })
            ),
            transition('nav-off <=> nav-on', [animate('400ms ease-in-out')]),
        ]),
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
        trigger('mobileMenuTop', [
            state(
                'no-block, void',
                style({
                    overflow: 'hidden',
                    height: '0px',
                })
            ),
            state(
                'yes-block',
                style({
                    height: AUTO_STYLE,
                })
            ),
            transition('no-block <=> yes-block', [
                animate('400ms ease-in-out'),
            ]),
        ]),
    ],
})
export class AdminComponent implements OnInit {
    public navType: string;
    public themeLayout: string;
    public verticalPlacement: string;
    public verticalLayout: string;
    public pcodedDeviceType: string;
    public verticalNavType: string;
    public verticalEffect: string;
    public vnavigationView: string;
    public freamType: string;
    public sidebarImg: string;
    public sidebarImgType: string;
    public layoutType: string;

    public headerTheme: string;
    public pcodedHeaderPosition: string;

    public liveNotification: string;
    public liveNotificationClass: string;

    public profileNotification: string;
    public profileNotificationClass: string;

    public chatSlideInOut: string;
    public innerChatSlideInOut: string;

    public searchWidth: number;
    public searchWidthString: string;

    public navRight: string;
    public windowWidth: number;
    public chatTopPosition: string;

    public toggleOn: boolean;
    public navBarTheme: string;
    public activeItemTheme: string;
    public pcodedSidebarPosition: string;

    public headerFixedTop: string;

    public menuTitleTheme: string;
    public dropDownIcon: string;
    public subItemIcon: string;

    public configOpenRightBar: string;
    public displayBoxLayout: string;
    public isVerticalLayoutChecked: boolean;
    public isSidebarChecked: boolean;
    public isHeaderChecked: boolean;
    public headerFixedMargin: string;
    public sidebarFixedHeight: string;
    public sidebarFixedNavHeight: string;
    public itemBorderStyle: string;
    public subItemBorder: boolean;
    public itemBorder: boolean;
    public snowEffect: boolean;

    public isCollapsedSideBar: string;
    public psDisabled: string;

    public config: any;
    public ipAddress: any;

    scroll = (): void => {
        const scrollPosition = window.pageYOffset;
        if (scrollPosition > 56) {
            if (this.isSidebarChecked === true) {
                this.pcodedSidebarPosition = 'fixed';
            }
            this.headerFixedTop = '0';
            this.sidebarFixedNavHeight = '100%';
        } else {
            this.headerFixedTop = 'auto';
            this.pcodedSidebarPosition = 'absolute';
            this.sidebarFixedNavHeight = '';
        }
    };

    notificaciones: any[] = [];
    showbtn = false;
    user = {
        nombre: '',
        nivel: 0,
        subnivel: 0,
        imagen: '',
    };

    theme = {
        layoutType: 'light',
        headerTheme: 'theme1',
        sidebarImg: 'false',
        navBarTheme: 'themelight1',
        menuTitleTheme: 'theme1',
        freamType: 'theme1',
        navType: 'st2',
        themeLayout: 'vertical',
        verticalPlacement: 'left',
        verticalLayout: 'wide',
        pcodedDeviceType: 'desktop',
        verticalNavType: 'expanded',
        verticalEffect: 'shrink',
        vnavigationView: 'view1',
        sidebarImgType: 'img',
        pcodedHeaderPosition: 'fixed',
        headerFixedTop: 'auto',
        liveNotification: 'an-off',
        profileNotification: 'an-off',
        chatSlideInOut: 'out',
        innerChatSlideInOut: 'out',
        searchWidth: 0,
        navRight: 'nav-on',
        dropDownIcon: 'style3',
        subItemIcon: 'style7',
        displayBoxLayout: 'd-none',
        isVerticalLayoutChecked: false,
        isSidebarChecked: true,
        isHeaderChecked: true,
        headerFixedMargin: '56px',
        sidebarFixedHeight: 'calc(100vh - 217px)',
        itemBorderStyle: 'none',
        subItemBorder: true,
        itemBorder: true,
        isCollapsedSideBar: 'no-block',
        activeItemTheme: 'theme1',
        pcodedSidebarPosition: 'fixed',
        toggleOn: true,
        backgroundPattern: 'theme1',
        snowEffect: false,
    };

    busqueda = {
        criterio: '',
        campo: 'id',
    };

    sessionTime: any = '';

    constructor(
        public menuItems: MenuItems,
        private router: Router,
        private renderer: Renderer2,
        private http: HttpClient,
        private auth: AuthService
    ) {
        const user = JSON.parse(this.auth.userData().sub);
        this.user = user;

        if (user.empresas == undefined) {
            this.logout();
        }

        this.user.nombre = (
            user.nombre.split(' ')[0] +
            ' ' +
            user.nombre.split(' ')[1]
        ).toUpperCase();
        this.user.imagen = user.imagen;

        var user_theme = JSON.parse(localStorage.getItem('crm_theme'));

        if (user_theme != undefined) {
            this.theme = user_theme;
        } else {
            localStorage.setItem('crm_theme', JSON.stringify(this.theme));
        }

        this.navType = this.theme.navType;
        this.themeLayout = this.theme.themeLayout;
        this.verticalPlacement = this.theme.verticalPlacement;
        this.verticalLayout = this.theme.verticalLayout;
        this.pcodedDeviceType = this.theme.pcodedDeviceType;
        this.verticalNavType = this.theme.verticalNavType;
        this.verticalEffect = this.theme.verticalEffect;
        this.vnavigationView = this.theme.vnavigationView;
        this.freamType = this.theme.freamType;
        this.sidebarImg = this.theme.sidebarImg;
        this.sidebarImgType = this.theme.sidebarImgType;
        this.layoutType = this.theme.layoutType; // light(default) dark(dark)

        this.headerTheme = this.theme.headerTheme; // theme1(default)
        this.pcodedHeaderPosition = this.theme.pcodedHeaderPosition;

        this.headerFixedTop = this.theme.headerFixedTop;

        this.liveNotification = this.theme.liveNotification;
        this.profileNotification = this.theme.profileNotification;

        this.chatSlideInOut = this.theme.chatSlideInOut;
        this.innerChatSlideInOut = this.theme.innerChatSlideInOut;

        this.searchWidth = this.theme.searchWidth;

        this.navRight = this.theme.navRight;

        this.windowWidth = window.innerWidth;
        this.setHeaderAttributes(this.windowWidth);

        this.toggleOn = this.theme.toggleOn;
        this.navBarTheme = this.theme.navBarTheme; // themelight1(default) theme1(dark)
        this.activeItemTheme = this.theme.activeItemTheme;
        this.pcodedSidebarPosition = this.theme.pcodedSidebarPosition;
        this.menuTitleTheme = this.theme.menuTitleTheme; // theme1(default) theme10(dark)
        this.dropDownIcon = this.theme.dropDownIcon;
        this.subItemIcon = this.theme.subItemIcon;

        this.displayBoxLayout = this.theme.displayBoxLayout;
        this.isVerticalLayoutChecked = this.theme.isVerticalLayoutChecked;
        this.isSidebarChecked = this.theme.isSidebarChecked;
        this.isHeaderChecked = this.theme.isHeaderChecked;
        this.headerFixedMargin = this.theme.headerFixedMargin;
        this.sidebarFixedHeight = this.theme.sidebarFixedHeight;
        this.itemBorderStyle = this.theme.itemBorderStyle;
        this.subItemBorder = this.theme.subItemBorder;
        this.itemBorder = this.theme.itemBorder;

        this.isCollapsedSideBar = this.theme.isCollapsedSideBar;
        this.snowEffect = this.theme.snowEffect;

        this.setMenuAttributes(this.windowWidth);
        this.setHeaderAttributes(this.windowWidth);

        var pusher = new Pusher('d2163e9e88304df4c43e', {
            wsHost: 'ws.pusherapp.com',
            httpHost: 'sockjs.pusher.com',
            encrypted: true,
        });

        var channel = pusher.subscribe('crm-angular');
        var $this = this;

        channel.bind('crm-angular-notificacion', function (data) {
            var mensaje = JSON.parse(data.message);

            var notificaciones = [];
            if (mensaje.usuario != undefined) {
                if ($.isArray(mensaje.usuario)) {
                    mensaje.usuario.forEach((usuario) => {
                        if (usuario == user.id) {
                            notificaciones.push({
                                id: mensaje.id,
                                titulo: mensaje.titulo,
                                message: mensaje.message,
                                tipo: mensaje.tipo,
                                link: mensaje.link,
                                alerta: `${mensaje.alerta == 2 ? 2 : 1}`,
                            });

                            $this.playSoundNotification();
                            if (mensaje.alerta == 2) {
                                swal({
                                    title: mensaje.titulo,
                                    text: mensaje.message,
                                    type: 'info',
                                });
                            }
                        }
                    });
                } else {
                    if (mensaje.usuario == user.id) {
                        notificaciones.push({
                            id: mensaje.id,
                            titulo: mensaje.titulo,
                            message: mensaje.message,
                            tipo: mensaje.tipo,
                            link: mensaje.link,
                            alerta: `${mensaje.alerta == 2 ? 2 : 1}`,
                        });

                        $this.playSoundNotification();
                        if (mensaje.alerta == 2) {
                            swal({
                                title: mensaje.titulo,
                                text: mensaje.message,
                                type: 'info',
                            });
                        }
                    }
                }
            }

            if (mensaje.reload_users != undefined) {
                localStorage.removeItem('crm_user');
                localStorage.removeItem('crm_date');

                $this.router.navigate(['auth/login']);
            }

            $this.agregarNotificacion(notificaciones);
        });
    }

    ngOnInit() {
        this.sessionTimeLeft();
        this.setBackgroundPattern(this.theme.backgroundPattern);
        this.changeOverflowBehavior();

        this.http.get(`${backend_url}general/notificacion/data`).subscribe(
            (res) => {
                if (res['code'] != 200) {
                    swal('1', res['message'], 'error');

                    return;
                }

                this.notificaciones = res['notificaciones'];
            },
            (response) => {
                swal({
                    title: '2',
                    type: 'error',
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === 'object'
                            ? response.error.error_summary
                            : response.error,
                });
            }
        );

        this.http
            .get(`http://api.ipify.org/?format=json`)
            .subscribe((res: any) => {
                this.ipAddress = res.ip;
            });
    }

    elementInArray(array1, array2) {
        if (!array1) {
            return false;
        }

        return array1.some((r) => array2.includes(r));
    }

    sublevelInArray(sublevel, user_sublevels, section_levels) {
        var sublevels = [];

        section_levels.forEach((level) => {
            var concat = sublevels.concat(user_sublevels[level]);
            sublevels = concat;
        });

        return sublevels.indexOf(sublevel) >= 0 ? true : false;
    }

    agregarNotificacion(notificaciones) {
        if (notificaciones.length > 0) {
            notificaciones.forEach((notificacion) => {
                this.notificaciones.push(notificacion);
            });
        }
    }

    onResize(event) {
        this.windowWidth = event.target.innerWidth;
        this.setHeaderAttributes(this.windowWidth);

        let reSizeFlag = true;
        if (
            this.pcodedDeviceType === 'tablet' &&
            this.windowWidth >= 768 &&
            this.windowWidth <= 1024
        ) {
            reSizeFlag = false;
        } else if (
            this.pcodedDeviceType === 'mobile' &&
            this.windowWidth < 768
        ) {
            reSizeFlag = false;
        }
        /* for check device */
        if (reSizeFlag) {
            this.setMenuAttributes(this.windowWidth);
        }
    }

    setHeaderAttributes(windowWidth) {
        if (windowWidth < 992) {
            this.navRight = 'nav-off';
        } else {
            this.navRight = 'nav-on';
        }
    }

    setMenuAttributes(windowWidth) {
        if (windowWidth >= 768 && windowWidth <= 1024) {
            this.pcodedDeviceType = 'tablet';
            this.verticalNavType = 'offcanvas';
            this.verticalEffect = 'overlay';
        } else if (windowWidth < 768) {
            this.pcodedDeviceType = 'mobile';
            this.verticalNavType = 'offcanvas';
            this.verticalEffect = 'overlay';
        } else {
            this.pcodedDeviceType = 'desktop';
            this.verticalNavType = 'expanded';
            this.verticalEffect = 'shrink';
        }
    }

    toggleHeaderNavRight() {
        this.navRight = this.navRight === 'nav-on' ? 'nav-off' : 'nav-on';
        this.chatTopPosition = this.chatTopPosition === 'nav-on' ? '112px' : '';
        if (this.navRight === 'nav-off' && this.innerChatSlideInOut === 'in') {
            this.toggleInnerChat();
        }
        if (this.navRight === 'nav-off' && this.chatSlideInOut === 'in') {
            this.toggleChat();
        }
    }

    toggleLiveNotification() {
        this.liveNotification =
            this.liveNotification === 'an-off' ? 'an-animate' : 'an-off';
        this.liveNotificationClass =
            this.liveNotification === 'an-animate' ? 'active' : '';

        if (
            this.liveNotification === 'an-animate' &&
            this.innerChatSlideInOut === 'in'
        ) {
            this.toggleInnerChat();
        }
        if (
            this.liveNotification === 'an-animate' &&
            this.chatSlideInOut === 'in'
        ) {
            this.toggleChat();
        }
    }

    toggleProfileNotification() {
        this.profileNotification =
            this.profileNotification === 'an-off' ? 'an-animate' : 'an-off';
        this.profileNotificationClass =
            this.profileNotification === 'an-animate' ? 'active' : '';

        if (
            this.profileNotification === 'an-animate' &&
            this.innerChatSlideInOut === 'in'
        ) {
            this.toggleInnerChat();
        }
        if (
            this.profileNotification === 'an-animate' &&
            this.chatSlideInOut === 'in'
        ) {
            this.toggleChat();
        }
    }

    notificationOutsideClick(ele: string) {
        if (ele === 'live' && this.liveNotification === 'an-animate') {
            this.toggleLiveNotification();
        } else if (
            ele === 'profile' &&
            this.profileNotification === 'an-animate'
        ) {
            this.toggleProfileNotification();
        }
    }

    toggleChat() {
        this.chatSlideInOut = this.chatSlideInOut === 'out' ? 'in' : 'out';
        if (this.innerChatSlideInOut === 'in') {
            this.innerChatSlideInOut = 'out';
        }
    }

    toggleInnerChat() {
        this.innerChatSlideInOut =
            this.innerChatSlideInOut === 'out' ? 'in' : 'out';
    }

    searchOn() {
        document.querySelector('#main-search').classList.add('open');
        const searchInterval = setInterval(() => {
            if (this.searchWidth >= 225) {
                clearInterval(searchInterval);
                return false;
            }
            this.searchWidth = this.searchWidth + 25;
            this.searchWidthString = this.searchWidth + 'px';

            let inputElement = this.renderer.selectRootElement('#searchInput');
            inputElement.focus();
        }, 35);

        this.showbtn = true;
    }

    searchOff() {
        const searchInterval = setInterval(() => {
            if (this.searchWidth <= 0) {
                document.querySelector('#main-search').classList.remove('open');
                clearInterval(searchInterval);
                return false;
            }
            this.searchWidth = this.searchWidth - 25;
            this.searchWidthString = this.searchWidth + 'px';
        }, 35);

        this.showbtn = false;
    }

    toggleOpened() {
        if (this.windowWidth < 992) {
            this.toggleOn =
                this.verticalNavType === 'offcanvas' ? true : this.toggleOn;
            if (this.navRight === 'nav-on') {
                this.toggleHeaderNavRight();
            }
        }
        this.verticalNavType =
            this.verticalNavType === 'expanded' ? 'offcanvas' : 'expanded';
    }

    onClickedOutsideSidebar(e: Event) {
        if (
            (this.windowWidth < 992 &&
                this.toggleOn &&
                this.verticalNavType !== 'offcanvas') ||
            this.verticalEffect === 'overlay'
        ) {
            this.toggleOn = true;
            this.verticalNavType = 'offcanvas';
        }
    }

    toggleRightbar() {
        this.configOpenRightBar =
            this.configOpenRightBar === 'open' ? '' : 'open';
    }

    setNavBarTheme(theme: string) {
        if (theme === 'themelight1') {
            this.navBarTheme = 'themelight1';
            this.menuTitleTheme = 'theme1';
            this.sidebarImg = 'false';
        } else {
            this.menuTitleTheme = 'theme9';
            this.navBarTheme = 'theme1';
            this.sidebarImg = 'false';
        }

        this.theme.navBarTheme = this.navBarTheme;
        this.theme.menuTitleTheme = this.menuTitleTheme;
        this.theme.sidebarImg = this.sidebarImg;

        this.updateTheme();
    }

    setLayoutType(type: string) {
        if (type === 'dark') {
            this.layoutType = type;
            this.headerTheme = 'theme6';
            this.sidebarImg = 'false';
            this.navBarTheme = 'theme1';
            this.menuTitleTheme = 'theme9';
            this.freamType = 'theme6';
            document.querySelector('body').classList.add('dark');
            this.setBackgroundPattern('theme6');
            this.activeItemTheme = 'theme1';

            this.theme.layoutType = type;
            this.theme.headerTheme = this.headerTheme;
        } else if (type === 'light') {
            this.layoutType = type;
            this.sidebarImg = 'false';
            this.headerTheme = 'theme1';
            this.navBarTheme = 'themelight1';
            this.menuTitleTheme = 'theme1';
            this.freamType = 'theme1';
            document.querySelector('body').classList.remove('dark');
            this.setBackgroundPattern('theme1');
            this.activeItemTheme = 'theme1';

            this.theme.layoutType = type;
            this.theme.headerTheme = this.headerTheme;
        } else if (type === 'img') {
            this.sidebarImg = 'true';
            this.navBarTheme = 'themelight1';
            this.menuTitleTheme = 'theme1';
            this.freamType = 'theme1';
            document.querySelector('body').classList.remove('dark');
            this.setBackgroundPattern('theme1');
            this.activeItemTheme = 'theme1';
        }

        this.theme.sidebarImg = this.sidebarImg;
        this.theme.navBarTheme = this.navBarTheme;
        this.theme.menuTitleTheme = this.menuTitleTheme;
        this.theme.freamType = this.freamType;
        this.theme.activeItemTheme = this.activeItemTheme;

        this.updateTheme();
    }

    setVerticalLayout() {
        this.isVerticalLayoutChecked = !this.isVerticalLayoutChecked;
        if (this.isVerticalLayoutChecked) {
            this.verticalLayout = 'box';
            this.displayBoxLayout = '';
        } else {
            this.verticalLayout = 'wide';
            this.displayBoxLayout = 'd-none';
        }

        this.theme.isVerticalLayoutChecked = this.isVerticalLayoutChecked;
        this.theme.verticalLayout = this.verticalLayout;
        this.theme.displayBoxLayout = this.displayBoxLayout;

        this.updateTheme();
    }

    setSnowEffect() {
        this.snowEffect = !this.snowEffect;

        this.theme.snowEffect = this.snowEffect;

        this.changeOverflowBehavior();
        this.updateTheme();
    }

    setBackgroundPattern(pattern: string) {
        document.querySelector('body').setAttribute('themebg-pattern', pattern);

        this.theme.backgroundPattern = pattern;

        this.updateTheme();
    }

    setSidebarPosition() {
        this.isSidebarChecked = !this.isSidebarChecked;
        this.pcodedSidebarPosition =
            this.isSidebarChecked === true ? 'fixed' : 'absolute';
        this.sidebarFixedHeight =
            this.isSidebarChecked === true
                ? 'calc(100vh - 217px)'
                : 'calc(100vh + 236px)';

        this.theme.isSidebarChecked = this.isSidebarChecked;
        this.theme.pcodedSidebarPosition = this.pcodedSidebarPosition;
        this.theme.sidebarFixedHeight = this.sidebarFixedHeight;

        this.updateTheme();
    }

    setHeaderPosition() {
        this.isHeaderChecked = !this.isHeaderChecked;
        this.pcodedHeaderPosition =
            this.isHeaderChecked === true ? 'fixed' : 'relative';
        this.headerFixedMargin = this.isHeaderChecked === true ? '56px' : '';

        if (this.isHeaderChecked === false) {
            window.addEventListener('scroll', this.scroll, true);
            window.scrollTo(0, 0);
        } else {
            window.removeEventListener('scroll', this.scroll, true);
            this.headerFixedTop = 'auto';
            this.pcodedSidebarPosition = 'fixed';
            this.sidebarFixedHeight =
                this.isSidebarChecked === true
                    ? 'calc(100vh - 292px)'
                    : 'calc(100vh + 292px)';
        }

        this.theme.isHeaderChecked = this.isHeaderChecked;
        this.theme.pcodedHeaderPosition = this.pcodedHeaderPosition;
        this.theme.headerFixedMargin = this.headerFixedMargin;
        this.theme.headerFixedTop = this.headerFixedTop;
        this.theme.pcodedSidebarPosition = this.pcodedSidebarPosition;
        this.theme.sidebarFixedHeight = this.sidebarFixedHeight;

        this.updateTheme();
    }

    changeOverflowBehavior() {
        document.body.style.overflowY = this.snowEffect ? 'scroll' : 'auto';
    }

    logout() {
        localStorage.removeItem('crm_user');
        localStorage.removeItem('crm_date');
        localStorage.removeItem('crm_access_token');

        this.router.navigate(['auth/login']);
    }

    updateTheme() {
        localStorage.setItem('crm_theme', JSON.stringify(this.theme));
    }

    navigateSearch() {
        if ($.trim(this.busqueda.criterio) == '') {
            return;
        }

        this.router.navigate([
            '/general/busqueda/venta',
            this.busqueda.campo,
            encodeURI(this.busqueda.criterio),
        ]);
    }

    itsTimeForSnow() {
        const its_christmas_time = new Date();

        return its_christmas_time.getMonth() == 11 ? true : false;
    }

    limpiarNotificacion(id_notificacion, link) {
        var form_data = new FormData();
        form_data.append('notificacion', id_notificacion);

        this.http
            .post(`${backend_url}general/notificacion/dismiss`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.notificaciones.forEach((notificacion, index) => {
                            if (notificacion.id == id_notificacion) {
                                this.notificaciones.splice(index, 1);
                            }
                        });
                    } else {
                        swal({
                            title: '',
                            type: 'error',
                            html: res['message'],
                        });
                    }

                    $('#loading-spinner').fadeOut();
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });

                    $('#loading-spinner').fadeOut();
                }
            );

        if (link != undefined) {
            this.router.navigate([link]);
        }
    }

    limpiarTodas() {
        this.notificaciones.forEach((notificacion) => {
            var form_data = new FormData();
            form_data.append('notificacion', notificacion.id);

            this.http
                .post(`${backend_url}general/notificacion/dismiss`, form_data)
                .subscribe(
                    (res) => {
                        if (res['code'] != 200) {
                            swal({
                                title: '',
                                type: 'error',
                                html: res['message'],
                            });
                        }
                    },
                    (response) => {
                        swal({
                            title: '',
                            type: 'error',
                            html:
                                response.status == 0
                                    ? response.message
                                    : typeof response.error === 'object'
                                    ? response.error.error_summary
                                    : response.error,
                        });
                    }
                );
        });

        this.notificaciones = [];
    }

    playSoundNotification() {
        let audio = new Audio();
        audio.src = '../../../assets/sounds/definite.mp3';
        audio.load();
        audio.play();
    }

    sessionTimeLeft() {
        var $this = this;
        // Set the date we're counting down to
        var countDownDate = new Date(this.auth.expirationDate()).getTime();

        // Update the count down every 1 second
        var x = setInterval(function () {
            // Get today's date and time
            var now = new Date().getTime();

            // Find the distance between now and the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            $this.sessionTime = hours + 'h ' + minutes + 'm ' + seconds + 's ';

            // If the count down is finished, write some text
            if (distance < 0) {
                swal({
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    showCancelButton: false,
                    showCloseButton: false,

                    title: 'Sesion Expirada',
                    type: 'error',
                    html:
                        'Su sesión ha expirado<br/>' +
                        `recargue la página o haga click en el siguiente enlace:<br/>` +
                        `<h1> <a href='http://afa.spaxium.com:11227/#/auth/login'>http://afa.spaxium.com:11227/#/auth/login</a></h1>`,
                });
                localStorage.removeItem('crm_user');
                localStorage.removeItem('crm_date');
                localStorage.removeItem('crm_access_token');
                clearInterval(x);
                $this.sessionTime = 'SESIÓN EXPIRADA';
            }
        }, 1000);
    }
}
