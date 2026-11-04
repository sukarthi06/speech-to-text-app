import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';
import { User } from '../../types/user-type';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [Header, Footer, DatePipe],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './profile.css',
})
export class Profile {
  protected readonly user = httpResource<User>(() => `${environment.apiUrl}/api/user/me`);
}