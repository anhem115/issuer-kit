// animations.ts
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

export const Animations = {

    fadeBtns:
        trigger('fadeBtns', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateX(-100px)'
                }),
                animate(400,
                    style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    }),
                )
            ]),
            transition(':leave', [
                style({

                }),
                animate(400,
                    style({
                        opacity: 0,
                        transform: 'translateX(-100px)'
                    }),
                )
            ])
        ]),
    fadeQR:
        trigger('fadeQR', [
            transition(':enter', [
                style({
                    opacity: 0,
                    position: 'absolute',
                    transform: 'translateX(+600px)'
                }),
                animate(600,
                    style({
                        opacity: 1,
                        transform: 'translateX(0px)'
                    })),
            ]),
            transition(':leave', [
                style({
                    position: 'absolute',
                }),
                animate(600,
                    style({
                        opacity: 0,
                        transform: 'translateX(+600px)'
                    }))
            ])
        ]),
    fader:
        trigger('routeAnimations', [
            transition('* => *', [
                style({
                    position: 'relative',
                }),
                query(':enter, :leave', [
                    style({
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: 0,
                    })
                ],
                    { optional: true }),
                query(':leave',
                    [
                        style({
                            opacity: 1,
                            width: '100%',
                            height: '100%',
                        }),
                        animate(200, style({ opacity: 0 }))
                    ],
                    { optional: true }
                ),

                query(':enter',
                    [
                        style({
                            opacity: 0,
                            width: '100%',
                            height: '100%',
                        }),
                        animate(400, style({ opacity: 1 }))
                    ],
                    { optional: true }
                )

            ])

        ]),
    faderForm:
        trigger('faderForm', [
            
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateX(-100px)'
                }),
                animate(400,
                    style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    }),
                )
            ]),
            transition(':leave', [
                style({

                }),
                animate(400,
                    style({
                        opacity: 0,
                        transform: 'translateX(-100px)'
                    }),
                )
            ])
        ]),
}