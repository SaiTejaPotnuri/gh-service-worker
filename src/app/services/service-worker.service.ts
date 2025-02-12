import { Injectable } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/*When checkForUpdates is called, it triggers the service worker to check for updates, and if an update is found, it will emit a VersionEvent that is caught by the versionUpdates Observable.
 then version update listener is called */
export class ServiceWorkerService {
  private readonly UPDATE_CHECK_INTERVAL = 10 * 1000; // 10 seconds
  private readonly RETRY_INTERVAL = 5 * 1000; // 5 seconds
  newVersionAvailable = false;

  constructor(private swUpdate: SwUpdate) {
    console.log('Service Worker Enabled:', this.swUpdate.isEnabled);
    this.initializeServiceWorkerUpdates();
  }

  private initializeServiceWorkerUpdates() {
    // Check if service workers are supported
    if (!this.swUpdate.isEnabled) {
      console.warn('Service Workers are not supported in this environment');
      return;
    }

    // Initial update check
    this.checkForUpdates();

    // Periodic update checks
    this.setupPeriodicUpdateChecks();

    // Listen for version updates
    this.listenForVersionUpdates();
  }

  private checkForUpdates() {
    console.log('Checking for updates...');
    this.swUpdate
      .checkForUpdate()
      .then((updateAvailable) => {
        console.log('Update is available', updateAvailable);
        if (updateAvailable) {
          this.newVersionAvailable = true;
        }
      })
      .catch((err) => {
        console.error('Error checking for updates', err);
        // Schedule a retry if update check fails
        setTimeout(() => this.checkForUpdates(), this.RETRY_INTERVAL);
      });
  }

  private setupPeriodicUpdateChecks() {
    interval(this.UPDATE_CHECK_INTERVAL).subscribe(() => {
      console.log('Checking for updates periodically...');
      this.checkForUpdates();
    });
  }

  private listenForVersionUpdates() {
    this.swUpdate.versionUpdates.subscribe(
      (event: VersionEvent) => {
        console.log('Version update event:', event);

        switch (event.type) {
          case 'VERSION_DETECTED':
            console.log('New version detected');
            break;
          case 'VERSION_READY':
            console.log('New version ready to activate');
            this.newVersionAvailable = true;
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.error('Version installation failed', event.error);
            break;
          default:
            console.log('Unknown version event', event);
        }
      },
      (error) => {
        console.error('Error in version updates listener:', error);
      }
    );
  }

  public activateUpdate() {
    this.swUpdate
      .activateUpdate()
      .then(() => {
        console.log('Update activated, reloading application');
        window.location.reload();
      })
      .catch((err) => {
        console.error('Failed to activate update', err);
      });
  }
}