import { Component, OnInit } from '@angular/core';
import { DoctorDashboardService } from './doctor-dashboard.service';
import { DoctorService } from '../doctor.service';
import { Doctor,Slot } from 'src/app/models/doctor';
import { DatePipe } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

enum Tab {
  Profile = 'profile',
  Appointments = 'appointments',
  Slots = 'slot'
}

@Component({
  selector: 'app-dashboard-doctor',
  templateUrl: './dashboard-doctor.component.html',
  styleUrls: ['./dashboard-doctor.component.css'],
  animations: [
    trigger('slideIndicator', [
      state('1', style({ transform: 'translateY(0px)' })),
      state('2', style({ transform: 'translateY(52px)' })),
      state('3', style({ transform: 'translateY(104px)' })),
      transition('* => *', animate('0.3s ease-out'))
    ]),
    trigger('slideA', [
      state('1', style({ transform: 'translateX(+30px)' })),
      state('0', style({ transform: 'translateY(0px)' })),
      transition('* => *', animate('0.3s ease-out'))
    ])
  ]
})
export class DashboardDoctorComponent implements OnInit {

  activeTab: Tab = Tab.Profile;
  doctor!: Doctor;
  doctorId: any;
  birthday: any | undefined;

  startTimeFirst:string = '';
  endTimeFirst:string = '';
  startTimeSecond:string = '';
  endTimeSecond:string = '';

  compareTimes(endTime: string, startTime: string): boolean {
    const endDateTime = new Date(`1970-01-01T${endTime}`);
    const startDateTime = new Date(`1970-01-01T${startTime}`);

    return endDateTime <= startDateTime;
  }

  selectedTime:any;

  profile: any; 
  appointments: any; 
  slot: any; 

  isEditProfileModalOpen = false;

  currdate : Date = new Date();
  todaydate : any;
  today: any;
  
  timeSlots: { day: Date; break: string ; startTimeFirst: number | undefined; endTimeFirst: number | undefined; startTimeSecond: number | undefined; endTimeSecond: number | undefined }[] = [];

  selectedslots:any = -1;

  disableRadio: boolean = true;

  slotTiming = [
    { label : '30 minute', value : 30 },
    { label : '60 minute', value : 60 }
  ]

  days = [
    { label: 'Select Your Day for slot', value: -1},
  ];

  Alldays = [
    { label: 'Monday', value: 'Monday'},
    { label: 'Tuesday', value: 'Tuesday'},
    { label: 'Wednesday', value: 'Wednesday'},
    { label: 'Thursday', value: 'Thursday'},
    { label: 'Friday', value: 'Friday'},
    { label: 'Saturday', value: 'Saturday'},
    { label: 'Sunday', value: 'Sunday'}
  ];

  openEditProfilePopup() {
    this.isEditProfileModalOpen = true;
  }

  closeModal() {
    this.isEditProfileModalOpen = false;
  }

  constructor(
    public doctorServ: DoctorService,
    private datePipe: DatePipe
  ) {}
  get Tab() {
    return Tab;
  }

  getshow(tab: string)
  {
    return tab === this.activeTab ? 1 : 0;
  }

  getTabIndex(tab: string): string {
    if (tab === 'profile') {
      return '1';  // Current tab, higher index
    } else if (tab === 'appointments') {
      return '2';  // Tab with label 'appointments'
    } else if (tab === 'slot') {
      return '3';  // Tab with label 'slot'
    } else {
      return '0';  // Other tabs, lower index
    }
  }
  view_profile(): void {
    this.activeTab = Tab.Profile;
    this.profile = true;
    this.appointments = false;
    this.slot = false;
  }

  // Change active tab to Appointments
  view_appointments(): void {
    this.activeTab = Tab.Appointments;
    this.profile = false;
    this.appointments = true;
    this.slot = false;
    console.log('activeTab:', this.activeTab);
  }

  // Change active tab to Slots
  view_slots(): void {
    this.activeTab = Tab.Slots;
    this.profile = false;
    this.appointments = false;
    this.slot = true;
    console.log('activeTab:', this.activeTab);
  }


  calculateTimeSlots() {

    this.timeSlots.splice(0, this.timeSlots.length);
    this.days.splice(1, this.days.length);

    //console.log("timeslots : {0}",this.timeSlots);
    //console.log("days : {0}",this.days);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1); // Get the date for tomorrow

    for (let i = 0; i < 7; i++) {

      const currentDate = new Date();
      currentDate.setDate(tomorrow.getDate() + i);
    
      const _day = this.datePipe.transform(currentDate, 'EEEE');
      const __day:string = _day !== null ? _day : 'DefaultDay';

      let temp : number = 0;

      switch (__day) {
        case 'Monday':
          temp =0;
          break;
        case 'Tuesday':
          temp =1;
          break;
        case 'Wednesday':
          temp =2;
          break;
        case 'Thursday':
          temp =3;
          break;
        case 'Friday':
          temp =4;
          break;
        case 'Saturday':
          temp =5;
          break;
        case 'Sunday':
          temp =6;
          break;
        default:
          temp =0;
          break;
      }
      //console.log(temp);

      // Replace 'yourStartTime' and 'yourEndTime' with your actual time slot values
      /*const timeSlot = {
        day: currentDate,
        break : this.doctor?.Starting_time_second[temp] == 0 ? "No"  : "Yes",
        startTimeFirst: this.doctor?.Starting_time_first[temp],
        endTimeFirst: this.doctor?.Ending_time_first[temp],
        startTimeSecond:this.doctor?.Starting_time_second[temp],
        endTimeSecond:this.doctor?.Ending_time_second[temp],
      };

      const tempday = {
        label: __day,
        value: temp
      };

      this.days.push(tempday);
      this.timeSlots.push(timeSlot);*/
    }
    //console.log("timeSlots : ");
    //console.log(this.timeSlots);
  }

  updateDoctor(updatedDoctor: Doctor): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log(this.doctorId);
      // Use your DoctorService to update the doctor data
      this.doctorServ.updateDoctor(this.doctorId,updatedDoctor).subscribe(
        async data => {
          // Handle successful update, maybe show a success message
          console.log('Doctor updated successfully');
          // Reload the doctor data after the update
          await this.loadDoctorData();
          resolve();
        },
        error => {
          console.error('Error updating doctor', error);
          // Handle error, maybe show an error message
          reject(error);
        }
      );
    } 
    );
  }

  loadDoctorData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.doctorId = localStorage.getItem('userId');
  
      this.doctorServ.getDoctor(this.doctorId).subscribe(
        data => {
          this.doctor = data;
          console.log("DashBoard");
          console.log(this.doctor);
  
          // Convert UTC date to India time zone
          this.birthday = this.datePipe.transform(this.doctor?.DoB, 'd MMM, yyyy');
          this.calculateTimeSlots();
          resolve();
        },
        error => {
          console.error("error", error);
          reject(error);
        }
      );
    });
  }  

  onTimeSet(event: any) {
    this.selectedTime = event;
    console.log('Selected Time:', this.selectedTime);
    // Perform additional actions if needed
  }

  async submitForm(){

    console.log("Inside submitForm");
    console.log(this.startTimeFirst);
    //console.log("doctor : ");
    //console.log(this.doctor);
    // console.log("selected slot : ");
    // console.log(this.selectedslots);

    /*let befor_break = this.doctor.Ending_time_first[this.selectedslots] - this.doctor.Starting_time_first[this.selectedslots];
    let after_break = this.doctor.Ending_time_second[this.selectedslots] - this.doctor.Starting_time_second[this.selectedslots];

    let no_h = befor_break + after_break; 
    let multi;
    if(this.doctor.Slot_length == 60)
    {
      multi = 1;
    }
    else
    {
      multi = 2;
    }

    const no_slot: number = no_h * multi;

    let Slots:Slot[] ;   
    
    while (no_slot) {
      let s :Slot;
      s.Time = this.doctor.Slots[this.selectedslots]
    }

    let list_of_slot: number[] = Array.from({ length: no_slot }, () => 1);*/
    //this.doctor.Slots[this.selectedslots] = list_of_slot;
    //console.log("doctor : ");
    console.log(this.doctor);
    //await this.updateDoctor(this.doctor);
    //await this.loadDoctorData();
    //this.calculateTimeSlots();
  }

  
  async ngOnInit() : Promise<void> {
    
    await this.loadDoctorData();
    this.view_profile();
    console.log(this.doctorId);
    //console.log(this.currdate);
    this.today= this.datePipe.transform(this.currdate,'EEEE');
    this.todaydate=this.datePipe.transform(this.currdate,'MMMM d');
    //console.log(this.today);
    //console.log(this.todaydate);
    //this.calculateTimeSlots();
  }
}
