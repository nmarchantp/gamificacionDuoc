import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarApiService {

  private apiUrl = 'https://ui-avatars.com/api/';

  constructor(public http: HttpClient) { }

  traerAvatar(name: string):string {
    console.log('El nombre a traer es: ', name)
    if(!name){
      throw  new Error('Nombre no puede estar vacio');

    }

    const formateoNombre = name.split(' ').join('+');
    console.log('Nombre formateado: ',formateoNombre);
    
    const url = `${this.apiUrl}?name=${formateoNombre}&background=random&color=ffffff&size=128`
    
    console.log(url);
    return url;  
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
