import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { ApiInterceptor } from './services/interceptor.service';
import { QrcodeComponent } from './components/qrcode/qrcode.component';
import { CredentialComponent } from './components/credential/credential.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ConnectionComponent } from './components/connection/connection.component';
import { AccptedConnectionComponent } from './components/accpted-connection/accpted-connection.component';
import { AfterConnectComponent } from './after-connect/after-connect.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonBoxComponent } from './components/button-box/button-box.component';
import { FooterComponent } from './components/footer/footer.component';
import { SuccessComponent } from './success/success.component';
import { SentBenefitComponent } from './sent-benefit/sent-benefit.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AddressFormComponent } from './components/address-form/address-form.component';

@NgModule({
  declarations: [
    AppComponent,
    QrcodeComponent,
    CredentialComponent,
    ConnectionComponent,
    AccptedConnectionComponent,
    AfterConnectComponent,
    NavigationComponent,
    HomeComponent,
    LoginComponent,
    ButtonBoxComponent,
    FooterComponent,
    SuccessComponent,
    SentBenefitComponent,
    SpinnerComponent,
    AddressFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QRCodeModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
