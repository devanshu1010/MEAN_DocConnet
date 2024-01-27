import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponentPatient } from './Patient/auth/signin/signin.component';
import { RegistrationComponentPatient } from './Patient/auth/registration/registration.component';
import {PatientDashboardComponent} from './Patient/patient-dashboard/patient-dashboard.component';
import { RegistrationComponentDoctor } from './Doctor/auth/registration/registration.component';
import { SigninComponentDoctor } from './Doctor/auth/signin/signin.component';
import { DashboardDoctorComponent } from './Doctor/dashboard-doctor/dashboard-doctor.component';
import { HomeDoctorComponent } from './Doctor/home-doctor/home-doctor.component';
import { HomePatientComponent } from './Patient/home-patient/home-patient.component';
import { DoctorCardComponent } from './Patient/home-patient/doctor-card/doctor-card.component';
import { BookAppointmentComponent } from './Patient/home-patient/book-appointment/book-appointment.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  {path:'',redirectTo:'homepatient',pathMatch:'full'},
  {path:'signinDoctor',component:SigninComponentDoctor},
  {path:'registerDoctor',component:RegistrationComponentDoctor},
  {path:'signinPatient',component:SigninComponentPatient},
  {path:'registerPatient',component:RegistrationComponentPatient},
  {path:'dashboardPatient',component:PatientDashboardComponent},
  {path:'dashboardDoctor',component:DashboardDoctorComponent},
  {path:'homedoctor',component:HomeDoctorComponent},
  {path:'homepatient',component:HomePatientComponent},
  {path:'doctor-details/:id', component: DoctorCardComponent },
  {path:'bookappointment/:id', component: BookAppointmentComponent },
  {path:'logout', component :LogoutComponent},
  {path: '**', redirectTo: '/homepatient', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
