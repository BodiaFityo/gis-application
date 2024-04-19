import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {RouterOutlet, provideRouter} from '@angular/router';
import {appRoutes} from './app.routes';
import {provideHttpClient} from '@angular/common/http';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, RouterOutlet],
    providers: [provideRouter(appRoutes), provideHttpClient()],
    bootstrap: [AppComponent],
})
export class AppModule {}
