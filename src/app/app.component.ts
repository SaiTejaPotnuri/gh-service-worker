import { Component } from '@angular/core';
import { ServiceWorkerService } from './services/service-worker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'service-worker-demo';
  constructor(public serviceWorker: ServiceWorkerService) {
 }


 closeNotification(){
  this.serviceWorker.newVersionAvailable = false
 }

}
