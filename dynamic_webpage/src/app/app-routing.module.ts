import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DomainComponent } from './domain/domain.component';
import { HomeComponent } from './home/home.component';
import { TrailComponent } from './trail/trail.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:'login', component:LoginComponent},
  { path: 'home', component: HomeComponent },
  { path: 'domain/:name', component: DomainComponent },
  {path : 'trail', component:TrailComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
