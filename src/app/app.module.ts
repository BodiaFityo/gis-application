import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {RouterOutlet, provideRouter} from '@angular/router';
import {appRoutes} from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, RouterOutlet, BrowserAnimationsModule],
    providers: [provideRouter(appRoutes), provideHttpClient()],
    bootstrap: [AppComponent],
})
export class AppModule {}
