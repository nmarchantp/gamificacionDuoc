import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.component.html',
  styleUrls: ['./qrscanner.component.scss'],
})
export class QRScannerComponent implements OnInit {
  imageUrl: string | null = null;

  constructor() {}

  ngOnInit() {
    Camera.requestPermissions();
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      this.imageUrl = image.webPath;
      console.log('Foto tomada:', this.imageUrl);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }
}
