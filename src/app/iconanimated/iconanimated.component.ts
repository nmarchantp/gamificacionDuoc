import { Component } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-iconanimated',
  templateUrl: './iconanimated.component.html',
  styleUrls: ['./iconanimated.component.scss'],
  animations: [
    trigger('shake', [
      state('still', style({
        transform: 'rotate(0)'
      })),
      state('shaking', style({
        transform: 'rotate(0)'
      })),
      transition('still => shaking', [
        animate('1000ms ease-in-out', keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(-15deg)', offset: 0.1 }),
          style({ transform: 'rotate(15deg)', offset: 0.2 }),
          style({ transform: 'rotate(-10deg)', offset: 0.3 }),
          style({ transform: 'rotate(10deg)', offset: 0.4 }),
          style({ transform: 'rotate(-5deg)', offset: 0.5 }),
          style({ transform: 'rotate(5deg)', offset: 0.6 }),
          style({ transform: 'rotate(-3deg)', offset: 0.7 }),
          style({ transform: 'rotate(3deg)', offset: 0.8 }),
          style({ transform: 'rotate(0deg)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class IconanimatedComponent {
  state: string = 'still';

  constructor() {
    // Cambiar el estado cada 3 segundos para activar la animación
    setInterval(() => {
      this.state = this.state === 'still' ? 'shaking' : 'still';
    }, 3000); // 3 segundos
  }
}