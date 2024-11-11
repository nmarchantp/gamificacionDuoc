import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-avatar-selector',
  templateUrl: './avatar-selector.component.html',
  styleUrls: ['./avatar-selector.component.scss']
})
export class AvatarSelectorComponent implements OnInit {
  avatars = [
    { url: 'assets/images/avatars/avatar1.png', category: 'male' },
    { url: 'assets/images/avatars/avatar2.png', category: 'male' },
    { url: 'assets/images/avatars/avatar3.png', category: 'male' },
    { url: 'assets/images/avatars/avatar4.png', category: 'male' },
    { url: 'assets/images/avatars/avatar5.png', category: 'male' },
    { url: 'assets/images/avatars/avatar6.png', category: 'male' },
    { url: 'assets/images/avatars/avatar7.png', category: 'male' },
    { url: 'assets/images/avatars/avatar8.png', category: 'male' },
    { url: 'assets/images/avatars/avatar9.png', category: 'male' },
    { url: 'assets/images/avatars/avatar10.png', category: 'male' },
    { url: 'assets/images/avatars/avatar24.png', category: 'male' },
    { url: 'assets/images/avatars/avatar11.png', category: 'female' },
    { url: 'assets/images/avatars/avatar12.png', category: 'female' },
    { url: 'assets/images/avatars/avatar13.png', category: 'female' },
    { url: 'assets/images/avatars/avatar14.png', category: 'female' },
    { url: 'assets/images/avatars/avatar15.png', category: 'female' },
    { url: 'assets/images/avatars/avatar16.png', category: 'female' },
    { url: 'assets/images/avatars/avatar17.png', category: 'female' },
    { url: 'assets/images/avatars/avatar18.png', category: 'female' },
    { url: 'assets/images/avatars/avatar19.png', category: 'female' },
    { url: 'assets/images/avatars/avatar20.png', category: 'female' },
    { url: 'assets/images/avatars/avatar21.png', category: 'female' },
    { url: 'assets/images/avatars/avatar22.png', category: 'female' },
    { url: 'assets/images/avatars/avatar23.png', category: 'female' },
    { url: '', category: 'other' },
    { url: '', category: 'other' },
    { url: '', category: 'other' },
    { url: '', category: 'other' },
    { url: '', category: 'other' },
    { url: '', category: 'other' },
    { url: '', category: 'other' },
    
    // Agrega todos los avatares con sus categorías correspondientes
  ];

  selectedCategory: string = 'all';
  filteredAvatars = this.avatars;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.filterAvatars();
  }

  filterAvatars() {
    if (this.selectedCategory === 'all') {
      this.filteredAvatars = this.avatars;
    } else {
      this.filteredAvatars = this.avatars.filter(avatar => avatar.category === this.selectedCategory);
    }
  }

  selectAvatar(avatarUrl: string) {
    this.modalController.dismiss(avatarUrl);
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
