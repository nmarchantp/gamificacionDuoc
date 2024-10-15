import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  constructor(public http: HttpClient) { }

  //carga 5 usuarios, si quisieramos cargar mas aumentamos el numero de la url parametro results
  cargarUsuarios() {
    return this.http.get('https://randomuser.me/api/?results=5')
  }


  get(url: string, data:any):Observable<any> {
    return this.http.get(url);
  }

  post(url: string, data: any):Observable<any> {
    return this.http.post(url,data)
  }

  put(url: string, data:any):Observable<any> {
    return this.http.put(url,data);
  }

  delete(url: string):Observable<any> {
    return this.http.delete(url);
  }
}
