import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ButtonBoxComponent } from './components/button-box/button-box.component';
import { QrcodeComponent } from './components/qrcode/qrcode.component';
import { QRCodeModule } from 'angularx-qrcode';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormComponent } from './form/form.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './services/interceptor.service';
import { SharingService } from './services/shared.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {
  ReactiveFormsModule,
  ValidationErrors,
  FormControl,
} from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ProvinceFieldComponent } from './components/forms/province-field/province-field.component';
import { ProofPresentationComponent } from './components/proof-presentation/proof-presentation.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ProcessingComponent } from './processing/processing.component';
import { SuccessComponent } from './success/success.component';
import { ProofRequestComponent } from './proof-request/proof-request.component';
import { IssueCredentialComponent } from './issue-credential/issue-credential.component';
import { TierLevelComponent } from './components/tier-level/tier-level.component';
import { DateFieldComponent } from './components/forms/date-field/date-field.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { SinFieldComponent } from './components/forms/sin-field/sin-field.component';
import { PostalFieldComponent } from './components/forms/postal-field/postal-field.component';
import { MobileFieldComponent } from './components/forms/mobile-field/mobile-field.component';
import { NumberFieldComponent } from './components/forms/number-field/number-field.component';
import { AlertComponent } from './components/alert/alert.component';

export let options: Partial<IConfig> | (() => Partial<IConfig>);

//Form custom validations

//Validation example
export function T1Validation(control: FormControl): ValidationErrors {
  return control.value ? null : { t1Validation: true };
}
export function EmptyValidation(control: FormControl): ValidationErrors {
  return control.value ? null : { empty: true };
}
export function PhoneValidation(control: FormControl): ValidationErrors {
  // console.log(control.value);
  return /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/.test(control.value)
    ? null
    : { phone: true };
}

//Message example
export function T1message(err, field: FormlyFieldConfig) {
  return `"${field.formControl.value}" is not a valid IP Address`;
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    ButtonBoxComponent,
    QrcodeComponent,
    HomeComponent,
    FormComponent,
    ProvinceFieldComponent,
    ProofPresentationComponent,
    ProcessingComponent,
    SuccessComponent,
    ProofRequestComponent,
    SpinnerComponent,
    IssueCredentialComponent,
    TierLevelComponent,
    DateFieldComponent,
    SinFieldComponent,
    PostalFieldComponent,
    MobileFieldComponent,
    NumberFieldComponent,
    AlertComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QRCodeModule,
    BrowserAnimationsModule,
    CollapseModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validators: [
        { name: 't1Validation', validation: T1Validation },
        { name: 'phone', validation: PhoneValidation },
        { name: 'empty', validation: EmptyValidation },
      ],
      validationMessages: [
        { name: 'required', message: `This field is required.` },
        { name: 'phone', message: `Verify the mobile number.` },
        { name: 'empty', message: `The field cannot be empty.` },
        {
          name: 'min-phone',
          message: `The field cannot have less than 10 digits.`,
        },
        { name: 't1Validation', message: T1message },
      ],
      types: [
        { name: 'date', component: DateFieldComponent },
        { name: 'sin', component: SinFieldComponent },
        { name: 'postal', component: PostalFieldComponent },
        { name: 'mobile', component: MobileFieldComponent },
        { name: 'number', component: NumberFieldComponent },
      ],
    }),
    NgxMaskModule.forRoot(),
    FormlyBootstrapModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    { provide: SharingService, useClass: SharingService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
