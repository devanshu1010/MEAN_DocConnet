import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseserviceService } from 'src/app/Doctor/dashboard-doctor/doctor-consulting/firebaseservice.service';
import { ServicesService } from '../../services.service';
import { Patient } from 'src/app/models/patient';

interface CallData {
  offer: any; // Adjust the type according to the actual type of offer data
}

@Component({
  selector: 'app-patient-consulting',
  templateUrl: './patient-consulting.component.html',
  styleUrls: ['./patient-consulting.component.css']
})
export class PatientConsultingComponent implements  OnInit,OnDestroy {

  isDoctor:Boolean = false;
  isLocal:Boolean = false;
  isRemote:Boolean = false;
  patient!: Patient;
  patientId: any;
  callId!: string; // Store the room ID
  peerConnection!: RTCPeerConnection; // Store the peer connection
  isCalling: boolean = false; // Flag to indicate call state
  localStream!: MediaStream; // Store the local media stream
  //remoteStream!: MediaStream; // Store the remote media stream
  socketService: any;

  app:any;
  analytics:any;

  @ViewChild('webcamVideo')
  webcamVideo!: ElementRef<HTMLVideoElement>;

  @ViewChild('remoteVideo')
  remoteVideo!: ElementRef<HTMLVideoElement>;
  remoteStream: MediaStream = new MediaStream();
  
  configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          // 'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 2,
  }

  constructor( private services : ServicesService, private firebaseService: FirebaseserviceService , private datePipe: DatePipe,private firestore: AngularFirestore ) { }

  async ngOnInit(): Promise<void> {

    await this.loadPatinetData();
    
    console.log(this.patientId);
    
    // Initialize peer connection configuration (refer to WebRTC documentation)
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Attach remote stream to video element
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;
    
  }

  handleRemoteStream(event: RTCTrackEvent) {
    event.streams[0].getTracks().forEach(track => {
      this.remoteStream.addTrack(track);
    });
  }

  ngOnDestroy() {
    // Clean up resources when the component is destroyed
    this.peerConnection.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
  }

  loadPatinetData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.patientId = '';
      this.patientId = localStorage.getItem('userId');

      this.services.getPatient(this.patientId).subscribe(
        data => {
          this.patient = data;
          console.log("DashBoard");
          console.log(this.patient);
          
          //this.calculateTimeSlots();
          resolve();
        },
        error => {
          console.error("error", error);
          reject(error);
        }
      );
    });
  }


  async startWebcam()
  {
    console.log("in startWebcame");
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.isLocal = true;
    
    console.log("in startWebcame1");
    // Push tracks from local stream to peer connection
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Show local stream in the video element
    if (this.localStream) {
      this.webcamVideo.nativeElement.srcObject = this.localStream;
    }

    this.peerConnection.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream!.addTrack(track);
      });
    };
  }

  async initiateCall() {
    // Obtain user media permissions using navigator.mediaDevices.getUserMedia()
    // ... (access media devices, create local stream)

    // Create an offer and add the local stream to the peer connection
    try {
      console.log("InitiaeCall called.");
      const callDocRef = await this.firebaseService.createCallDocument();
      console.log("createCallDocument completed.");
      this.callId = callDocRef.id;
      const offerCandidates = callDocRef.collection('offerCandidates');
      const answerCandidates = callDocRef.collection('answerCandidates');

      this.peerConnection.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      console.log("Calling  createOffer.");
      const offerDescription = await this.peerConnection.createOffer();
      console.log("createOffer completed.");
      await this.peerConnection.setLocalDescription(offerDescription);

      console.log("setLocalDescription completed.");
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await callDocRef.set({ offer });

      // Listen for remote answer
    const unsubscribe = callDocRef.onSnapshot((snapshot: { data: () => any; }) => {
      const data = snapshot.data();
      if (!this.peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.peerConnection.setRemoteDescription(answerDescription);
        unsubscribe(); // Unsubscribe from further snapshot changes
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot: { docChanges: () => any[]; }) => {
      snapshot.docChanges().forEach((change: { type: string; doc: { data: () => RTCIceCandidateInit | undefined; }; }) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.peerConnection.addIceCandidate(candidate);
        }
      });
    });
      console.log("InitiaeCall completed.");

      // const offer = await this.peerConnection.createOffer();
      // this.peerConnection.setLocalDescription(offer);

      // // Send the offer to the backend (refer to SocketService implementation)
      // this.socketService.emit('createRoom', { offer });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // async answerCall() {
  //   try {
  //     console.log("answerCall");
  //     console.log("Retrieving call data");
  //     console.log('callid',this.callId);

  //     if (!this.callId) {
  //       console.error("Call ID is empty");
  //       return;
  //     }
  
  //     const docRef = this.firestore.collection('calls').doc(this.callId);
  //     const docSnapshot = await docRef.get().toPromise();
  
  //     if (!docSnapshot || !docSnapshot.exists) {
  //       console.error("Call document does not exist");
  //       return;
  //     }
  
  //     // Ensure that docSnapshot is defined before accessing its properties
  //     const data = docSnapshot.data();
  //     if (data) {
  //       console.log("Document data:", data);
  //       // Further processing of data or updating UI goes here
  //     } else {
  //       console.error("Document data is undefined");
  //     }
  
  //   } catch (error) {
  //     console.error('Error answering call:', error);
  //   }
  // }

  async answerCall() {
    try {
      console.log("answerCall");
      console.log('callid',this.callId);

      if (!this.callId) {
        console.error("Call ID is empty");
        return;
      }
      const callDocRef = this.firebaseService.getCallDocument(this.callId);
      // const callDocRef = this.firestore.collection('calls').doc(this.callId);
      const answerCandidates = callDocRef.collection('answerCandidates');
      const offerCandidates = callDocRef.collection('offerCandidates');

      this.peerConnection.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };
  
      console.log("Retrieving call data");

      let c_id;
      let offer:CallData;

      // const docRef = this.firestore.collection('calls').doc(this.callId);
      // const d = docRef.get().subscribe((docSnapshot) => {
      //   console.log("docSnapshot", docSnapshot);
      //   console.log("hello");
      //   if (!docSnapshot.exists) {
      //     console.error("Call document does not exist");
      //     return;
      //   }
      //   // Handle the document data here if it exists
      //   const data = docSnapshot.data();
      //   console.log("Document data:", data);
      // });

  
      callDocRef.get().subscribe((callSnapshot) => {
        if (!callSnapshot.exists) {
          console.error("Call document does not exist");
          return;
        }
  
        const callData = callSnapshot.data() as CallData;
        console.log("callData:");
        console.log(callData);

        if (!callData || !callData.offer) {
          console.error("Offer description is missing");
          return;
        }
  
        const offerDescription = callData.offer;
        console.log("offerDescription:");
        console.log(offerDescription);
  
        if (!offerDescription) {
          console.error("Offer description is missing");
          return;
        }
  
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription))
          .then(() => {
            this.peerConnection.createAnswer()
              .then((answerDescription) => {
                this.peerConnection.setLocalDescription(answerDescription)
                  .then(() => {
                    const answer = {
                      type: answerDescription.type,
                      sdp: answerDescription.sdp,
                    };
                    console.log("answer:");
                    console.log(answer);
  
                    callDocRef.update({ answer });
                    console.log("callDocRef:");
                    console.log(callDocRef);
  
                    offerCandidates.snapshotChanges().subscribe((snapshot) => {
                      snapshot.forEach((change) => {
                        console.log("offerCandidates change");
                        if (change.type === 'added') {
                          console.log("offerCandidates added");
                          const data = change.payload.doc.data();
                          console.log(data);
                          this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                          console.log(this.peerConnection);
                        }
                      });
                    });
                    this.isRemote = true;
                    console.log("Answering call completed");
                  })
                  .catch((error) => {
                    console.error('Error setting local description:', error);
                  });
              })
              .catch((error) => {
                console.error('Error creating answer:', error);
              });
          })
          .catch((error) => {
            console.error('Error setting remote description:', error);
          });
      });
    } catch (error) {
      console.error('Error answering call:', error);
    }
  }

  
}
function take(arg0: number): import("rxjs").OperatorFunction<any, unknown> {
  throw new Error('Function not implemented.');
}
