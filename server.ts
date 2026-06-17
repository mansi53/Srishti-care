/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// JSON parsing middleware
app.use(express.json());

// IN-MEMORY DATABASE SEED
let doctors = [
  {
    doctor_id: "doc-1",
    name: "Dr. Suman Saini",
    specialization: "General Medicine",
    experience: 12,
    availability: "09:00 AM - 01:00 PM",
    room_number: "Room 101"
  },
  {
    doctor_id: "doc-2",
    name: "Dr. Rahul Malhotra",
    specialization: "Cardiology",
    experience: 15,
    availability: "10:00 AM - 04:00 PM",
    room_number: "Room 105"
  },
  {
    doctor_id: "doc-3",
    name: "Dr. Ananya Iyer",
    specialization: "Pediatrics",
    experience: 8,
    availability: "11:00 AM - 03:00 PM",
    room_number: "Room 202"
  },
  {
    doctor_id: "doc-4",
    name: "Dr. Vikram Seth",
    specialization: "Dermatology",
    experience: 10,
    availability: "02:00 PM - 06:00 PM",
    room_number: "Room 208"
  }
];

let patients = [
  {
    patient_id: "pat-1",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 98765 43210",
    age: 34,
    gender: "Male"
  },
  {
    patient_id: "pat-2",
    name: "Neelam Sharma",
    email: "neelam@example.com",
    phone: "+91 87654 32109",
    age: 28,
    gender: "Female"
  }
];

let appointments = [
  {
    appointment_id: "apt-1",
    patient_id: "pat-1",
    doctor_id: "doc-1",
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: "10:30 AM",
    status: "Completed",
    created_at: new Date().toISOString()
  },
  {
    appointment_id: "apt-2",
    patient_id: "pat-2",
    doctor_id: "doc-1",
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: "11:00 AM",
    status: "In Consultation",
    created_at: new Date().toISOString()
  }
];

let queues = [
  {
    queue_id: "q-1",
    appointment_id: "apt-1",
    patient_id: "pat-1",
    doctor_id: "doc-1",
    queue_number: 1,
    queue_status: "Completed",
    estimated_wait_time: 0,
    created_at: new Date().toISOString()
  },
  {
    queue_id: "q-2",
    appointment_id: "apt-2",
    patient_id: "pat-2",
    doctor_id: "doc-1",
    queue_number: 2,
    queue_status: "In Consultation",
    estimated_wait_time: 5,
    created_at: new Date().toISOString()
  }
];

// Helper: Calculate queue statistics & waiting list metrics
function updateEstimatedTimes(docId: string) {
  // Get active queue sequence list for doctor that is either Waiting or In Consultation
  const doctorActiveQueues = queues
    .filter(q => q.doctor_id === docId && (q.queue_status === "Waiting" || q.queue_status === "In Consultation"))
    .sort((a, b) => a.queue_number - b.queue_number);

  let waitAccumulator = 0;
  doctorActiveQueues.forEach((q, idx) => {
    if (q.queue_status === "In Consultation") {
      q.estimated_wait_time = 5; // Direct consult duration remaining roughly
      waitAccumulator = 5;
    } else {
      waitAccumulator += 15; // Average waiting time increment
      q.estimated_wait_time = waitAccumulator;
    }
  });
}

// ---------------- HEALTH CHECK & DIAGNOSTICS ----------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Sristi Cares API Server", active_doctors: doctors.length });
});

// ---------------- PATIENT AUTH & REGISTRATION ----------------
app.post("/api/patients/register", (req, res) => {
  const { name, email, phone, age, gender } = req.body;
  if (!name || !email || !phone) {
    res.status(400).json({ error: "Missing required registration parameters" });
    return;
  }

  // Check if patient already exists
  const existing = patients.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.json({ success: true, patient: existing, message: "Patient registered previously" });
    return;
  }

  const newPatient = {
    patient_id: `pat-${Date.now()}`,
    name,
    email,
    phone,
    age: parseInt(age) || 30,
    gender: gender || "Other"
  };

  patients.push(newPatient);
  res.json({ success: true, patient: newPatient, message: "A new patient record was generated successfully!" });
});

app.post("/api/patients/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email parameter is required for Sristi Patient ID lookup" });
    return;
  }

  const patient = patients.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (patient) {
    res.json({ success: true, patient });
  } else {
    // Auto register for demo simplicity to make signup and login frictionless
    const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    const autoPatient = {
      patient_id: `pat-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1) || "Guest Patient",
      email: email,
      phone: "+91 91111 22222",
      age: 25,
      gender: "Male"
    };
    patients.push(autoPatient);
    res.json({ success: true, patient: autoPatient, message: "Account generated dynamically upon sign-in!" });
  }
});

// ---------------- DOCTOR DIRECTORY API ----------------
app.get("/api/doctors", (req, res) => {
  res.json(doctors);
});

// ---------------- PATIENT DIRECTORY API ----------------
app.get("/api/patients", (req, res) => {
  res.json(patients);
});

// ---------------- APPOINTMENT HANDLING & QUEUE INJECTION ----------------
app.post("/api/appointments/book", (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
  
  if (!patient_id || !doctor_id) {
    res.status(400).json({ error: "Invalid parameters. Both Patient & Doctor IDs are required." });
    return;
  }

  const doctor = doctors.find(d => d.doctor_id === doctor_id);
  const patient = patients.find(p => p.patient_id === patient_id);

  if (!doctor || !patient) {
    res.status(404).json({ error: "Patient or Doctor record not found." });
    return;
  }

  const appointment_id = `apt-${Date.now()}`;
  
  // Registering Appointment
  const newAppointment = {
    appointment_id,
    patient_id,
    doctor_id,
    appointment_date: appointment_date || new Date().toISOString().split('T')[0],
    appointment_time: appointment_time || "12:00 PM",
    status: "Waiting" as const,
    created_at: new Date().toISOString()
  };

  // Determine Queue Number for Doctor for today
  const doctorTodayApts = appointments.filter(a => a.doctor_id === doctor_id);
  const nextQueueNumber = doctorTodayApts.length + 1;

  // Insert to overall queue
  const newQueueEntry = {
    queue_id: `q-${Date.now()}`,
    appointment_id,
    patient_id,
    doctor_id,
    queue_number: nextQueueNumber,
    queue_status: "Waiting" as const,
    estimated_wait_time: 15,
    created_at: new Date().toISOString()
  };

  appointments.push(newAppointment);
  queues.push(newQueueEntry);
  
  // Re-calculate estimated waiting times for this doctor
  updateEstimatedTimes(doctor_id);

  res.json({
    success: true,
    appointment: newAppointment,
    queue: queues.find(q => q.queue_id === newQueueEntry.queue_id)
  });
});

// ---------------- QUEUE RETRIEVAL APIs ----------------
app.get("/api/queue", (req, res) => {
  res.json(queues);
});

// Fetch Active Live position trackers for a specific Patient
app.get("/api/queue/patient/:patient_id", (req, res) => {
  const { patient_id } = req.params;

  const patientQueueEntries = queues.filter(q => q.patient_id === patient_id);
  
  const enrichedTrackers = patientQueueEntries.map(q => {
    const doctor = doctors.find(d => d.doctor_id === q.doctor_id);
    const appointment = appointments.find(a => a.appointment_id === q.appointment_id);
    
    // Find how many patients are ahead of this patient for the same doctor with "Waiting" or "In Consultation" status
    const listForDoctor = queues
      .filter(entry => entry.doctor_id === q.doctor_id && (entry.queue_status === "Waiting" || entry.queue_status === "In Consultation"))
      .sort((a, b) => a.queue_number - b.queue_number);

    const positionIdx = listForDoctor.findIndex(entry => entry.queue_id === q.queue_id);
    const peopleAhead = positionIdx > 0 ? positionIdx : 0;

    // Find the patient currently being served (In Consultation) or the first in waiting
    const currentOnDuty = listForDoctor.find(entry => entry.queue_status === "In Consultation") 
      || listForDoctor.find(entry => entry.queue_status === "Waiting") 
      || null;

    let currentServingNumber = 0;
    let currentServingName = "None";
    if (currentOnDuty) {
      currentServingNumber = currentOnDuty.queue_number;
      const servingPatient = patients.find(p => p.patient_id === currentOnDuty.patient_id);
      currentServingName = servingPatient ? servingPatient.name : "Unknown";
    }

    return {
      queue_id: q.queue_id,
      appointment_id: q.appointment_id,
      doctor_name: doctor ? doctor.name : "Dr. Specialist",
      specialization: doctor ? doctor.specialization : "General Medicine",
      room_number: doctor ? doctor.room_number : "TBA",
      queue_number: q.queue_number,
      queue_status: q.queue_status,
      people_ahead: peopleAhead,
      current_patient_number: currentServingNumber,
      current_patient_name: currentServingName,
      estimated_wait_time: q.queue_status === "Waiting" ? (peopleAhead * 15 + 5) : (q.queue_status === "In Consultation" ? 5 : 0),
      appointment_status: appointment ? appointment.status : "Waiting"
    };
  });

  res.json(enrichedTrackers);
});

// ---------------- DOCTOR QUEUE ACTIONS ----------------
app.post("/api/doctor/queue/action", (req, res) => {
  const { doctor_id, queue_id, action } = req.body; // Action: "start" | "complete" | "skip" | "cancel"

  if (!queue_id || !action) {
    res.status(400).json({ error: "Queue ID and Action type are required" });
    return;
  }

  const queueIdx = queues.findIndex(q => q.queue_id === queue_id);
  if (queueIdx === -1) {
    res.status(404).json({ error: "Queue entry match identifier not found" });
    return;
  }

  const targetQueue = queues[queueIdx];
  const targetDocId = doctor_id || targetQueue.doctor_id;

  const aptIdx = appointments.findIndex(a => a.appointment_id === targetQueue.appointment_id);

  if (action === "start") {
    // Change any other 'In Consultation' of this doctor back to 'Completed' just in case
    queues.forEach(q => {
      if (q.doctor_id === targetDocId && q.queue_status === "In Consultation") {
        q.queue_status = "Completed";
        const matchedApt = appointments.find(a => a.appointment_id === q.appointment_id);
        if (matchedApt) matchedApt.status = "Completed";
      }
    });

    targetQueue.queue_status = "In Consultation";
    if (aptIdx !== -1) appointments[aptIdx].status = "In Consultation";
  } 
  else if (action === "complete") {
    targetQueue.queue_status = "Completed";
    if (aptIdx !== -1) appointments[aptIdx].status = "Completed";
  } 
  else if (action === "skip") {
    targetQueue.queue_status = "Completed"; // Advance queue
    if (aptIdx !== -1) appointments[aptIdx].status = "Cancelled";
  } 
  else if (action === "cancel") {
    targetQueue.queue_status = "Completed"; // Advance queue
    if (aptIdx !== -1) appointments[aptIdx].status = "Cancelled";
  }

  // Direct calculation update
  updateEstimatedTimes(targetDocId);

  res.json({ success: true, message: `Advanced queue with action: ${action}` });
});

// ---------------- ADMIN API ACTIONS ----------------
app.get("/api/admin/stats", (req, res) => {
  const total = appointments.length;
  const completed = appointments.filter(a => a.status === "Completed").length;
  const waiting = queues.filter(q => q.queue_status === "Waiting").length;
  const activeConsults = queues.filter(q => q.queue_status === "In Consultation").length;
  const cancelled = appointments.filter(a => a.status === "Cancelled").length;

  res.json({
    total_appointments: total,
    completed_consultations: completed,
    waiting_patients: waiting,
    active_consultations: activeConsults,
    cancelled_appointments: cancelled,
    doctors_count: doctors.length,
    patients_count: patients.length
  });
});

app.post("/api/admin/doctor/add", (req, res) => {
  const { name, specialization, experience, availability, room_number } = req.body;
  
  if (!name || !specialization) {
    res.status(400).json({ error: "Missing doctor specifications" });
    return;
  }

  const newDoc = {
    doctor_id: `doc-${Date.now()}`,
    name,
    specialization,
    experience: parseInt(experience) || 5,
    availability: availability || "09:00 AM - 05:00 PM",
    room_number: room_number || "Room Suite"
  };

  doctors.push(newDoc);
  res.json({ success: true, doctor: newDoc });
});

app.post("/api/admin/doctor/delete", (req, res) => {
  const { doctor_id } = req.body;
  doctors = doctors.filter(d => d.doctor_id !== doctor_id);
  res.json({ success: true });
});

// Mock simulation of other patients joining
app.post("/api/queue/simulate", (req, res) => {
  const { doctor_id } = req.body;
  const docId = doctor_id || "doc-1";

  const randomNames = ["Devendra Saini", "Shreya Verma", "Karan Johar", "Manisha Koirala", "Aaditya Malhotra", "Pranav Roy"];
  const selectedName = randomNames[Math.floor(Math.random() * randomNames.length)];
  const randomAge = Math.floor(Math.random() * 50) + 18;
  const randomGender = Math.random() > 0.5 ? "Male" : "Female";

  const p_id = `pat-sim-${Date.now()}`;
  const simulationPatient = {
    patient_id: p_id,
    name: selectedName,
    email: `${selectedName.toLowerCase().replace(/\s/g, "")}@simulated.com`,
    phone: "+91 99000 88000",
    age: randomAge,
    gender: randomGender
  };

  patients.push(simulationPatient);

  // Appt and Queue
  const a_id = `apt-sim-${Date.now()}`;
  const mockApt = {
    appointment_id: a_id,
    patient_id: p_id,
    doctor_id: docId,
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: "Simulation Time",
    status: "Waiting" as const,
    created_at: new Date().toISOString()
  };

  const doctorActiveApts = appointments.filter(a => a.doctor_id === docId);
  const nextQNum = doctorActiveApts.length + 1;

  const mockQueue = {
    queue_id: `q-sim-${Date.now()}`,
    appointment_id: a_id,
    patient_id: p_id,
    doctor_id: docId,
    queue_number: nextQNum,
    queue_status: "Waiting" as const,
    estimated_wait_time: 15,
    created_at: new Date().toISOString()
  };

  appointments.push(mockApt);
  queues.push(mockQueue);

  updateEstimatedTimes(docId);

  res.json({ success: true, patient_name: selectedName, queue_number: nextQNum });
});

// Setup Vite Dev server integration / Serve Static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import Vite to create server middleware in development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
