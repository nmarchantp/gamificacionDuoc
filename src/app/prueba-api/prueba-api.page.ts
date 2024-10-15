import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-prueba-api',
  templateUrl: './prueba-api.page.html',
  styleUrls: ['./prueba-api.page.scss'],
})
export class PruebaApiPage implements OnInit {

  usuarios: any[];

  constructor(private http: UserApiService) { }

  ngOnInit() {
  }

  cargarUsuarios(){
    this.http.cargarUsuarios().subscribe((res:any) => {
      this.usuarios = res.results;
    },
    (error) => {
      console.error(error);
  });
 }

}