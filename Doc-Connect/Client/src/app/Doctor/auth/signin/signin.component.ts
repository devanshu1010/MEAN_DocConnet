import { Component, OnInit } from '@angular/core';
import { DoctorAuthService } from '../doctor-auth.service';
import { Router } from '@angular/router';
import { ObjectId } from 'mongoose';
import { NavbarService } from 'src/app/navbar.service';

@Component({
  selector: 'app-signin-doctor',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponentDoctor implements OnInit{

  email:any ='';
  password:string ='';

  cssclass:string = "failed";
  incorrect:boolean = false;
  disablesiginin:boolean = true;
  doctor: any;
  userId: any;

  constructor (public doctorAuthServ:DoctorAuthService,private navbarService: NavbarService,private router: Router){}
  
  public signin():void {
    console.log("clicked");
    console.log(this.email);
    console.log(this.password);

    if(this.password && this.password )
    {
      //console.log("In login");
      const doctorData: any = {
        Email: this.email,
        Password: this.password,
      };
      
      this.doctorAuthServ.loginDoctor(doctorData).subscribe(
        data =>{
          //this.doctor = data;
          this.incorrect=false;
          //console.log("Login successful");
          console.log("data : ", data);
          console.log("data_id : ", data._id);
          this.userId = data._id;
          console.log("userId");
          console.log(this.userId);
          localStorage.removeItem("userId");
          localStorage.setItem('userId',this.userId);
          localStorage.setItem('jwt', data.token);

          this.email='';
          this.password='';
          localStorage.setItem('isLogin',"true");
          localStorage.setItem('mode','Doctor');
          this.navbarService.setMode('Doctor');
          this.router.navigate(['/homedoctor']);

        },
        error => {
          console.error("Login error", error);
          this.incorrect=true;
          // Handle login error (e.g., display an error message)
        }
      );
      
    }
    else{
      console.log("unsucessful not login");
      //console.log(this.patient);
      //this.value_border="red-500";
    }  
  }

  ngOnInit(): void {
    console.log("In login");
    localStorage.removeItem("userId");
    this.navbarService.setHideNavbar(true);
    this.router.navigate(['/signinDoctor']);
  }

}
