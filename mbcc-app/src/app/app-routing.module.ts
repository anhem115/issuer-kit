import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormComponent } from './form/form.component';
import { ProcessingComponent } from "./processing/processing.component";
import { SuccessComponent } from './success/success.component';

import { ProofRequestComponent } from './proof-request/proof-request.component';
import { IssueCredentialComponent } from './issue-credential/issue-credential.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: HomeComponent, data: { animation: 'one' } },
  { path: 'form', component: FormComponent, data: { animation: 'two' } },
  { path: 'processing', component: ProcessingComponent, data: { animation: 'three' } },
  { path: 'success', component: SuccessComponent, data: { animation: 'four' } },
  { path: 'proof-request', component: ProofRequestComponent, data: { animation: 'five' }, },
  { path: 'issue-credential', component: IssueCredentialComponent, data: { animation: 'six' }, },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
