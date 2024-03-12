const asyncHandler = require("express-async-handler");
const Appointment = require("../models/AppointmentSchema");
const Patient = require("../models/PatientSchema");
const Doctor = require("../models/DoctorSchema");

//@dec Book Appointment
//@route POST api/patient/appoitment/bookAppointment
//@access public
const bookAppointment = asyncHandler(async (req, res) => {
    try {
        //console.log(req.body);

        const appointment = await Appointment.create(req.body);
        console.log('saved');

        if (!appointment)
            res.send({ res: "Something went wrong. Failed to book Appointment." })

        let patient = await Patient.findByIdAndUpdate(req.body.Patient_id,
            {
                $push: { Appointment_id: appointment._id },
            },
            { new: true }
        );

        let doctor = await Doctor.findByIdAndUpdate(req.body.Doctor_id,
            {
                $push: { Appointment_id: appointment._id},
            },
            { new: true }
        );

        res.send(appointment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//@dec Cancle Appointment
//@route POST api/doctor/appoitment/cancleAppointment
//@access private
const cancleAppointment = asyncHandler(async(req, res) => {
    try {
        const { appointmentId } = req.body;
        
        const updateAppointment = await Appointment.findById(appointmentId);

        updateAppointment.Status = "Cancled"
        await updateAppointment.save();

    } catch(err) {

    }
});

module.exports = { bookAppointment, cancleAppointment };