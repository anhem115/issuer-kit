import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AfterConnectComponent } from './after-connect/after-connect.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SuccessComponent } from './success/success.component';
import { SentBenefitComponent } from './sent-benefit/sent-benefit.component';
import { AddressFormComponent } from './components/address-form/address-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '', component: HomeComponent, data: { animation: 'one' } },
  { path: 'login', component: LoginComponent, data: { animation: 'two' } },
  { path: 'connection', component: AfterConnectComponent, data: { animation: 'three' }},
  { path: 'success', component: SuccessComponent, data: { animation: 'four' }},
  { path: 'sent-benefit', component: SentBenefitComponent, data: { animation: 'five' }},
  { path: 'address-form', component: AddressFormComponent, data: { animation: 'six' }},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
