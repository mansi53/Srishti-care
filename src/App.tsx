/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  Building, 
  Users, 
  UserPlus, 
  ArrowRight, 
  Award, 
  Sparkles,
  RefreshCw,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Heart,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function App() {
  // --- CORE ROUTING/ROLE STATE ---
  // "landing" | "login_selector" | "patient" | "doctor" | "admin"
  const [activeRoleMode, setActiveRoleMode] = useState("landing");
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState("patient");

  // --- APPLICATION STATES ---
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total_appointments: 0,
    completed_consultations: 0,
    waiting_patients: 0,
    active_consultations: 0,
    cancelled_appointments: 0,
    doctors_count: 0,
    patients_count: 0
  });

  // Patient Profile state
  const [patientEmail, setPatientEmail] = useState("rajesh@example.com");
  const [patientProfile, setPatientProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patientTrackers, setPatientTrackers] = useState([]);

  // Registration Form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAge, setRegAge] = useState("28");
  const [regGender, setRegGender] = useState("Male");

  // Booking Form state
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Doctor Portal active physician selection
  const [activeDoctorPortalId, setActiveDoctorPortalId] = useState("doc-1");
  const [doctorQueue, setDoctorQueue] = useState([]);

  // Admin New Doctor input form
  const [adminDocName, setAdminDocName] = useState("");
  const [adminDocSpecialty, setAdminDocSpecialty] = useState("General Medicine");
  const [adminDocExp, setAdminDocExp] = useState("8");
  const [adminDocRoom, setAdminDocRoom] = useState("Room 303");
  const [adminDocTime, setAdminDocTime] = useState("09:00 AM - 05:00 PM");

  // Health tip active carousel index
  const [healthTipIndex, setHealthTipIndex] = useState(0);

  // General Notification Banner
  const [bannerAlert, setBannerAlert] = useState("");

  // --- MEDICAL RECORDS STATE ---
  const [medicalRecords, setMedicalRecords] = useState([
    {
      record_id: "rec-1",
      patient_id: "pat-1", // Rajesh Kumar
      doctor_name: "Dr. Suman Saini",
      specialization: "General Medicine",
      date: "2026-06-10",
      summary: "Viral Influenza & Low-Grade Fever",
      notes: "Presented with sore throat, nasal congestion, and mild body aches. Advised paracetamol 650mg as needed for fever and complete voice rest. Recommended drinking plenty of warm fluids.",
      vitals: { bp: "120/80 mmHg", pulse: "76 bpm", temp: "99.2 °F" },
      status: "Finalized"
    },
    {
      record_id: "rec-2",
      patient_id: "pat-1", // Rajesh Kumar
      doctor_name: "Dr. Rahul Malhotra",
      specialization: "Cardiology",
      date: "2026-05-12",
      summary: "Baseline Hypertension Review",
      notes: "ECG shows normal sinus rhythm. Patient's blood pressure is slightly elevated but controlled with daily low-sodium intake. Continue walking 30 mins daily. Monitor vitals weekly.",
      vitals: { bp: "135/84 mmHg", pulse: "68 bpm", temp: "98.4 °F" },
      status: "Finalized"
    },
    {
      record_id: "rec-3",
      patient_id: "pat-2", // Neelam Sharma
      doctor_name: "Dr. Vikram Seth",
      specialization: "Dermatology",
      date: "2026-06-02",
      summary: "Eczema Flare-up Treatment",
      notes: "Erythema and mild pruritus noted on left forearm. Prescribed topical Hydrocortisone cream 1% to be applied twice daily for 7 days. Advised allergen-free mild soap.",
      vitals: { bp: "115/75 mmHg", pulse: "72 bpm", temp: "98.6 °F" },
      status: "Finalized"
    }
  ]);

  // Form states for self-reported or manual clinical log entry
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [newRecDoctor, setNewRecDoctor] = useState("Dr. Suman Saini");
  const [newRecSpecialty, setNewRecSpecialty] = useState("General Medicine");
  const [newRecDate, setNewRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecSummary, setNewRecSummary] = useState("");
  const [newRecNotes, setNewRecNotes] = useState("");
  const [newRecBP, setNewRecBP] = useState("120/80");
  const [newRecPulse, setNewRecPulse] = useState("72");
  const [newRecTemp, setNewRecTemp] = useState("98.6");

  const healthTips = [
    {
      title: "Daily Hydration Balance",
      text: "Drink at least 3 liters of water everyday. Proper hydration supports metabolic pathways, keeps body temperatures down, and filters system waste continuously.",
      category: "Wellness"
    },
    {
      title: "Active Cardio Milestones",
      text: "Engage in 150 minutes of moderate cardiovascular workout or brisk walking every single week. This strengthens ventricular walls and maintains healthy baseline blood pressure.",
      category: "Heart Care"
    },
    {
      title: "Regular Vision Relaxation",
      text: "Utilize the 20-20-20 screen guidelines: Every 20 minutes spent looking at computers, look at an object at least 20 feet away for 20 seconds to drop optical muscles strain.",
      category: "Workplace Wellness"
    },
    {
      title: "Sufficient Sleep Hygiene",
      text: "Ensure 7 to 8 hours of deeper restful sleep each night. This unlocks circadian repair states, restores focus chemicals, and improves overall immune system defenses.",
      category: "General Health"
    }
  ];

  // --- INITIAL DATA FETCH & HOT SYNCHRONIZATION ---
  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(data);
      if (data.length > 0 && !bookingDoctorId) {
        setBookingDoctorId(data[0].doctor_id);
      }
    } catch (e) {
      console.error("Failed to load doctor directory", e);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (e) {
      console.error("Failed to load patient directory", e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load system stats", e);
    }
  };

  const fetchPatientQueueTracker = async (patientId) => {
    if (!patientId) return;
    try {
      const res = await fetch(`/api/queue/patient/${patientId}`);
      const data = await res.json();
      setPatientTrackers(data);
    } catch (e) {
      console.error("Failed to load patient queue status", e);
    }
  };

  const fetchWholeQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      const data = await res.json();
      // Filter for active doctor portal
      const filtered = data.filter((q) => q.doctor_id === activeDoctorPortalId);
      setDoctorQueue(filtered);
    } catch (e) {
      console.error("Failed to fetch full queue stream", e);
    }
  };

  // Sync state
  const synchronizeDatabase = () => {
    fetchDoctors();
    fetchPatients();
    fetchStats();
    if (patientProfile) {
      fetchPatientQueueTracker(patientProfile.patient_id);
    }
    fetchWholeQueue();
  };

  // Automatic synchronized heat polling (every 3 seconds) for outstanding real-time response
  useEffect(() => {
    synchronizeDatabase();
    const interval = setInterval(() => {
      synchronizeDatabase();
    }, 3000);
    return () => clearInterval(interval);
  }, [patientProfile, activeDoctorPortalId]);

  // Handle Simulated Patient Login lookup
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!patientEmail) return;

    try {
      const res = await fetch("/api/patients/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: patientEmail })
      });
      const data = await res.json();
      if (data.success) {
        setPatientProfile(data.patient);
        setIsAuthenticated(true);
        fetchPatientQueueTracker(data.patient.patient_id);
        setActiveRoleMode("patient");
        triggerBannerAlert(`Logged into Patient Portal successfully: ${data.patient.name}`);
      } else {
        alert("Patient profile not found. Please register as a new patient using the registration form!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle New Patient signup
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      alert("Please enter patient name, email, and mobile parameters first");
      return;
    }

    try {
      const res = await fetch("/api/patients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          age: parseInt(regAge, 10) || 28,
          gender: regGender
        })
      });
      const data = await res.json();
      if (data.success) {
        setPatientProfile(data.patient);
        setPatientEmail(data.patient.email);
        setIsAuthenticated(true);
        fetchPatientQueueTracker(data.patient.patient_id);
        // Clear inputs
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setActiveRoleMode("patient");
        triggerBannerAlert(`Successfully registered and logged in as: ${data.patient.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Logout patient
  const handleLogoutPatient = () => {
    setPatientProfile(null);
    setIsAuthenticated(false);
    setPatientTrackers([]);
    setActiveRoleMode("landing");
    triggerBannerAlert("Logged out of Sristi Patient Portal.");
  };

  // Handle online Booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!patientProfile) {
      alert("Please log in first as a patient to book appointments.");
      return;
    }

    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientProfile.patient_id,
          doctor_id: bookingDoctorId,
          appointment_date: bookingDate,
          appointment_time: bookingTime
        })
      });
      const data = await res.json();
      if (data.success) {
        synchronizeDatabase();
        triggerBannerAlert(`Appointment booked successfully! Your Queue Number is #${data.queue.queue_number}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Doctors consultations Queue Action
  const handleQueueAction = async (queueId, actionType) => {
    try {
      const res = await fetch("/api/doctor/queue/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: activeDoctorPortalId,
          queue_id: queueId,
          action: actionType
        })
      });
      const data = await res.json();
      if (data.success) {
        synchronizeDatabase();
        triggerBannerAlert(`Doctor queue advanced: Marked entry as ${actionType}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Admin Add Doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!adminDocName || !adminDocSpecialty) return;

    try {
      const res = await fetch("/api/admin/doctor/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminDocName,
          specialization: adminDocSpecialty,
          experience: parseInt(adminDocExp, 10) || 8,
          availability: adminDocTime,
          room_number: adminDocRoom
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminDocName("");
        synchronizeDatabase();
        triggerBannerAlert(`New specialist doctor added profile successfully: ${data.doctor.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin delete doctor
  const handleDeleteDoctor = async (docId) => {
    try {
      await fetch("/api/admin/doctor/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: docId })
      });
      synchronizeDatabase();
      triggerBannerAlert("Doctor removed successfully from clinic systems.");
    } catch (err) {
      console.error(err);
    }
  };

  // Queue traffic simulator injector
  const handleSimulateQueue = async () => {
    try {
      const res = await fetch("/api/queue/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: activeDoctorPortalId })
      });
      const data = await res.json();
      if (data.success) {
        synchronizeDatabase();
        triggerBannerAlert(`[Simulator] Added mock patient "${data.patient_name}" (Queue #${data.queue_number})!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerBannerAlert = (msg) => {
    setBannerAlert(msg);
    setTimeout(() => {
      setBannerAlert("");
    }, 4000);
  };

  // Pre-fill fields on mount
  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="sristi-cares-core-wrapper">
      
      {/* 1. Header Navigation Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs sticky top-0 z-50">
        <div 
          onClick={() => setActiveRoleMode("landing")} 
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-header-logo-click"
        >
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md group-hover:bg-indigo-700 transition-colors">
            <Stethoscope className="h-6 w-6 stroke-2" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block font-mono">Precision Digital Care</span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
              Sristi Cares
            </h1>
          </div>
        </div>

        {/* Global Mini status indicator (Anonymized metadata) */}
        <div className="hidden md:flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>Live Triage Portal <strong>{stats.waiting_patients} waiting</strong></span>
          </div>
          <div className="text-slate-400">|</div>
          <div className="text-slate-500 font-mono text-[11px]">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Dynamic Action Buttons based on authorization step */}
        <div className="flex items-center gap-2.5">
          {activeRoleMode === "landing" ? (
            <button
              onClick={() => {
                setSelectedRoleForLogin("patient");
                setActiveRoleMode("login_selector");
              }}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              id="cta-navbar-access"
            >
              <UserCheckIcon className="w-4 h-4" />
              Login / Sign Up
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveRoleMode("landing");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              id="navbar-back-to-home"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Return Main Portal
            </button>
          )}

          {activeRoleMode !== "landing" && activeRoleMode !== "login_selector" && (
            <button
              onClick={() => {
                // Return to login choice
                setActiveRoleMode("login_selector");
              }}
              className="px-3.5 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              id="navbar-switch-role"
              title="Change user console role"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Switch Role
            </button>
          )}
        </div>
      </header>

      {/* Live state action banner alerts */}
      {bannerAlert && (
        <div className="bg-indigo-900 text-white text-xs font-semibold px-4 py-3 text-center flex items-center justify-center gap-2 shadow-inner transition-transform duration-350" id="global-broadcast-banner">
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span>{bannerAlert}</span>
        </div>
      )}

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">

        {/* ========================================================== */}
        {/* VIEW 1: BASIC LANDING DASHBOARD (No Private Patient/Doctor Data) */}
        {/* ========================================================== */}
        {activeRoleMode === "landing" && (
          <div className="space-y-8 animate-fade-in" id="public-landing-view">
            
            {/* Elegant Healthcare Hero Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-10 lg:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)]"></div>
              
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 font-mono text-[10px] tracking-widest uppercase font-bold">
                  <Heart className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  Sristi Cares Digital Medical Desk
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Modernize Your Clinic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-emerald-300">Wait-Times</span> In Real-Time.
                </h2>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                  Sristi Cares delivers seamless digital triage, transparent specialist appointment scheduling, and automated live queue queue boards. Avoid endless waiting rooms and trace your exact queue position directly from home.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      setSelectedRoleForLogin("patient");
                      setActiveRoleMode("login_selector");
                    }}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-950 rounded-xl text-xs font-extrabold shadow-sm hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Enter Safe Portals
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                  </button>

                  <a
                    href="#how-it-works-anchor"
                    className="px-4 py-3 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Learn How Triage Works &darr;
                  </a>
                </div>
              </div>

              {/* Grid abstract overlay behind hero */}
              <div className="absolute right-6 bottom-4 opacity-10 hidden lg:block select-none pointer-events-none">
                <Stethoscope className="w-64 h-64 text-indigo-400" />
              </div>
            </div>

            {/* Public Statistics Dashboard Metrics Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="landing-stats-grid">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-indigo-150 transition-colors">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">In-Queue Today</span>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">{stats.total_appointments || 14} Patients</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-indigo-150 transition-colors">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Consults Done</span>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">{stats.completed_consultations || 8} Consults</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-indigo-150 transition-colors">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Specialists On Call</span>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">{stats.doctors_count || 5} Doctors</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-indigo-150 transition-colors">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Average Wait Time</span>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">12 mins</div>
                </div>
              </div>

            </div>

            {/* Health Wellness & Advisory Tips (Dynamic Interactive Component) */}
            <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                    <Heart className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800">Dynamic Wellness &amp; Clinical Advisory Hub</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setHealthTipIndex((prev) => (prev > 0 ? prev - 1 : healthTips.length - 1))}
                    className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer text-xs"
                    title="Previous Tip"
                  >
                    &larr;
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono px-1">
                    {healthTipIndex + 1}/{healthTips.length}
                  </span>
                  <button 
                    onClick={() => setHealthTipIndex((prev) => (prev < healthTips.length - 1 ? prev + 1 : 0))}
                    className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer text-xs"
                    title="Next Tip"
                  >
                    &rarr;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-md border border-indigo-100 inline-block font-mono">
                    {healthTips[healthTipIndex].category}
                  </span>
                  <h4 className="font-bold text-slate-850 text-[13px] mt-1.5 leading-snug">
                    {healthTips[healthTipIndex].title}
                  </h4>
                </div>
                <div className="md:col-span-9">
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                    {healthTips[healthTipIndex].text}
                  </p>
                </div>
              </div>
            </div>

            {/* Sristi Clinical Offerings & Areas */}
            <div className="space-y-4" id="how-it-works-anchor">
              <div className="text-center max-w-lg mx-auto space-y-1.5 pb-2">
                <span className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest block font-mono">Departments & Doctors Specialty</span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Medical Departments</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Our digital triage queue runs actively across these on-campus healthcare specialties with designated consulting rooms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all hover:shadow-xs space-y-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">General Medicine</h4>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Primary comprehensive healthcare diagnostics, general health certifications, immunization, cold-flu recovery, and daily clinical guidance.
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono block">Room 303 | Lobby A</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all hover:shadow-xs space-y-3">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl w-fit">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Cardiology Dept</h4>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Advanced ventricular analysis, ECG tests, blood pressure management, and specialist cardiovascular diagnosis from years of experience.
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono block">Room 102 | Sector B</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all hover:shadow-xs space-y-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Pediatrics Department</h4>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Nurturing child health, diagnostic check-ups, infant nutritional support, and growth milepost charting in a comfortable visual setup.
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono block">Room 204 | Lobby C</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all hover:shadow-xs space-y-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Dermatology Care</h4>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Eczema recovery plans, clinical skincare, therapeutic diagnostics, and allergy testing with gentle procedural care schemes.
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono block">Room 401 | Sector D</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all hover:shadow-xs space-y-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Orthopedics Clinics</h4>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Joint alignment, bone density checks, physiotherapist alignment guides, and post-accident bone triage recovery setups.
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono block">Room 150 | Triage Corridor</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all hover:shadow-xs space-y-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Gynaecology Section</h4>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Comprehensive maternal support, routine women health checks, fetal monitoring sessions, and prenatal consultation.
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono block">Room 201 | Lobby B</span>
                </div>

              </div>
            </div>

            {/* Seamless Triage CTA Action Board */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-indigo-950">Book Queue Token or View Doctor Desk</h4>
                <p className="text-xs text-slate-600">
                  Ready to manage your medical visit? Complete our fast email sign-in or register yourself as a guest patient to begin queuing!
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRoleForLogin("patient");
                  setActiveRoleMode("login_selector");
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-sm text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              >
                Access Secure Portals (Login/Sign Up)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 2: ROLE SELECTOR & ACCESS TERMINALS */}
        {/* ========================================================== */}
        {activeRoleMode === "login_selector" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" id="portal-selector-dashboard">
            
            <div className="text-center space-y-2">
              <div onClick={() => setActiveRoleMode("landing")} className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                &larr; Back to Main Homepage
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sristi Cares Identity Portal</h2>
              <p className="text-xs text-slate-550 max-w-md mx-auto">
                Please select your designated clinical role below to register, sign-in, and deploy your specialized clinical workspace dashboard.
              </p>
            </div>

            {/* Interactive Selector Tabs Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setSelectedRoleForLogin("patient")}
                className={`py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  selectedRoleForLogin === "patient" 
                    ? "bg-white text-indigo-705 shadow-xs font-black" 
                    : "text-slate-605 hover:text-slate-900"
                }`}
              >
                <User className="h-4 w-4" />
                Patient Portal
              </button>

              <button
                onClick={() => setSelectedRoleForLogin("doctor")}
                className={`py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  selectedRoleForLogin === "doctor" 
                    ? "bg-white text-amber-705 shadow-xs font-black" 
                    : "text-slate-605 hover:text-slate-900"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                Doctors Desk
              </button>

              <button
                onClick={() => setSelectedRoleForLogin("admin")}
                className={`py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  selectedRoleForLogin === "admin" 
                    ? "bg-white text-slate-900 shadow-xs font-black" 
                    : "text-slate-605 hover:text-slate-900"
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Hospital Admin
              </button>
            </div>

            {/* Render Selected Login Layout */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              
              {/* PATH A: PATIENT PORTAL LOGIN / SIGNUP */}
              {selectedRoleForLogin === "patient" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="patient-auth-grid">
                  
                  {/* Left Column: Sign In */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                        Patient Sign-In
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Access existing queue trackers, booked dates, and profile information.
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Registered Patient Email</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rajesh@example.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-colors font-medium bg-slate-50/50"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Enter Patient File
                      </button>
                    </form>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-500 leading-normal">
                      <span className="font-bold text-indigo-605 block">Demo Helper Access:</span>
                      <p>You can use the default test email values like <strong className="font-mono text-indigo-600">rajesh@example.com</strong> to examine mock appointments queue ticket setups immediately.</p>
                    </div>
                  </div>

                  {/* Right Column: Sign Up Registration */}
                  <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-slate-150 pt-6 lg:pt-0 lg:pl-8 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-600" />
                        New Patient Signup
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        No medical record on file? Register once to activate simulated queue tickets.
                      </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-550 uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kavya Deshmukh"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200 outline-none font-medium text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Email</label>
                          <input
                            type="email"
                            required
                            placeholder="kavya@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200 outline-none text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Contact No.</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765-43210"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200 outline-none text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Age</label>
                          <input
                            type="number"
                            required
                            placeholder="28"
                            value={regAge}
                            onChange={(e) => setRegAge(e.target.value)}
                            className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200 outline-none text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Gender</label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value)}
                            className="w-full text-xs px-2 py-2 rounded-lg border border-slate-200 outline-none bg-white font-medium cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 mt-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        Create My Patient File &amp; Log In
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* PATH B: DOCTOR PORTAL IDENTITY ACCESS */}
              {selectedRoleForLogin === "doctor" && (
                <div className="max-w-md mx-auto space-y-4" id="doctor-auth-area">
                  <div className="text-center space-y-1">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-fit mx-auto border border-amber-100">
                      <Stethoscope className="w-6.5 h-6.5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">Identify Active Physician</h3>
                    <p className="text-[11px] text-slate-450">
                      Select your clinical profile name to direct consultation rooms queues.
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Select Physician identity</label>
                      <select
                        value={activeDoctorPortalId}
                        onChange={(e) => setActiveDoctorPortalId(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-250 cursor-pointer rounded-xl font-bold outline-none"
                      >
                        {doctors.map((d) => (
                          <option key={d.doctor_id} value={d.doctor_id}>
                            {d.name} ({d.specialization}) - Room {d.room_number || "A"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setActiveRoleMode("doctor");
                        triggerBannerAlert(`Logged into Doctor Portal console for Doctor: ${doctors.find((d) => d.doctor_id === activeDoctorPortalId)?.name || 'Physician'}`);
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Authenticate and Access Doctor Desk &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* PATH C: ADMIN PORTAL SECURE LOG */}
              {selectedRoleForLogin === "admin" && (
                <div className="max-w-md mx-auto space-y-4" id="admin-auth-area">
                  <div className="text-center space-y-1">
                    <div className="p-3 bg-slate-100 text-slate-800 rounded-full w-fit mx-auto border border-slate-200">
                      <ShieldAlert className="w-6.5 h-6.5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">Secure Admin Authentication</h3>
                    <p className="text-[11px] text-slate-455">
                      Verify administrative privileges to manage clinic staff and check analytics.
                    </p>
                  </div>

                  <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-550 block uppercase tracking-wide">Administrator Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                        defaultValue="sristi123"
                      />
                      <span className="text-[9px] text-slate-400 font-mono block">Dev mode is bypass active: Enter any value, click login.</span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveRoleMode("admin");
                        triggerBannerAlert("Administrator Session Established Successfully.");
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-sm"
                    >
                      Open Administrative Console &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 3: SIMPLIFIED PATIENT PORTAL DASHBOARD */}
        {/* ========================================================== */}
        {activeRoleMode === "patient" && patientProfile && (
          <div className="space-y-6 animate-fade-in" id="active-patient-session">
            
            {/* Patient Header Section */}
            <div className="bg-gradient-to-r from-indigo-850 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/35 rounded-full text-[9px] font-mono tracking-widest text-indigo-305 uppercase font-bold">
                  Patient File Authorized
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                  <User className="h-5 w-5 text-indigo-400" />
                  Welcome back, {patientProfile.name}
                </h2>
                <div className="text-[10.5px] text-slate-300 space-x-1 font-medium font-mono">
                  <span>ID: {patientProfile.patient_id}</span>
                  <span>&bull;</span>
                  <span>{patientProfile.email}</span>
                  <span>&bull;</span>
                  <span>{patientProfile.phone}</span>
                  <span>&bull;</span>
                  <span>{patientProfile.gender}</span>
                  <span>&bull;</span>
                  <span>Age: <strong>{patientProfile.age}</strong></span>
                </div>
              </div>

              <button
                onClick={handleLogoutPatient}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout Patient
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (Span 7) - Available Doctors & Form */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Available Doctors list with Spezialität, Timings, Age/Experience */}
                <div className="bg-white rounded-2xl border border-slate-205 shadow-xs overflow-hidden">
                  <div className="border-b border-slate-100 p-4.5 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                        <Stethoscope className="h-4 w-4 stroke-2" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-800">Available Clinic Specialists</h3>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">
                      {doctors.length} Doctors Active
                    </span>
                  </div>

                  <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
                    {doctors.map((d) => (
                      <div 
                        key={d.doctor_id} 
                        className={`p-4 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer ${
                          bookingDoctorId === d.doctor_id ? "bg-indigo-50/30 border-indigo-250 ring-1 ring-indigo-200" : "bg-white"
                        }`}
                        onClick={() => setBookingDoctorId(d.doctor_id)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-800 text-[13px]">{d.name}</h4>
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-705 px-2 py-0.5 rounded-md font-mono">
                              Years Exp: {d.experience || 10}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                            <p className="flex items-center gap-1 font-semibold text-indigo-600">
                              Specialty: {d.specialization}
                            </p>
                            <p className="flex items-center gap-1 font-mono">
                              Room: {d.room_number}
                            </p>
                            <p className="flex items-center gap-1 font-medium col-span-2 text-slate-400">
                              🕒 Scheduled Availability: {d.availability || "09:00 AM - 05:00 PM"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingDoctorId(d.doctor_id);
                          }}
                          className={`self-start sm:self-center px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            bookingDoctorId === d.doctor_id 
                              ? "bg-indigo-600 text-white" 
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {bookingDoctorId === d.doctor_id ? "Schedules Selected" : "Select Doctor"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient simplified appointment scheduler */}
                <div className="bg-white rounded-2xl border border-slate-205 shadow-xs p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">Secure real-time Booking</h3>
                  </div>

                  <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="md:col-span-12">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Target Specialist</label>
                      <select
                        value={bookingDoctorId}
                        onChange={(e) => setBookingDoctorId(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-indigo-450 font-bold cursor-pointer outline-none"
                      >
                        {doctors.map((d) => (
                          <option key={d.doctor_id} value={d.doctor_id}>
                            {d.name} ({d.specialization}) - Room {d.room_number || 'A'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-6">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Appointment Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium cursor-pointer"
                      />
                    </div>

                    <div className="md:col-span-6">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Preferred Time Hours</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium cursor-pointer"
                      >
                        <option value="09:30 AM">09:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>

                    <div className="md:col-span-12 pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-indigo-900/10"
                      >
                        Book Appointment &amp; Insert Live Queue Ticket
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Right Column (Span 5) - Real-time queue tracker board */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-lg p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg">
                        <Activity className="h-4 w-4 animate-pulse" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-100">Live Active Queue Board</h3>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse font-mono block">
                      Sync Connective
                    </span>
                  </div>

                  {patientTrackers.length === 0 ? (
                    <div className="text-center py-10 px-4 space-y-3 bg-slate-950/60 rounded-xl border border-dashed border-slate-805 text-slate-400">
                      <Activity className="h-7 w-7 stroke-1 text-indigo-400 mx-auto opacity-50" />
                      <h4 className="text-xs font-bold text-slate-350">No Patient wait tokens booked yet</h4>
                      <p className="text-[11px] leading-relaxed max-w-xs mx-auto text-slate-500">
                        Choose clinical physicians from the directory, select your day times, and click Book to instantly preview your queue token place, waiting times, and lobby updates!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4.5" id="real-time-wait-ticker">
                      {patientTrackers.map((track) => {
                        const isWaiting = track.queue_status === "Waiting";
                        const isConsulting = track.queue_status === "In Consultation";
                        const isDone = track.queue_status === "Completed";
                        const isCancelled = track.appointment_status === "Cancelled";

                        return (
                          <div 
                            key={track.queue_id}
                            className={`p-4 rounded-xl border relative transition-all ${
                              isConsulting 
                                ? "bg-slate-950/90 border-indigo-500 ring-1 ring-indigo-500 animate-pulse" 
                                : isCancelled
                                  ? "bg-slate-850 border-rose-900/60 opacity-60"
                                  : "bg-slate-950/50 border-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-mono text-indigo-455 font-bold uppercase tracking-wider block">
                                  Triage Room Consultation
                                </span>
                                <h4 className="font-bold text-[13px] text-white mt-0.5">{track.doctor_name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                  {track.specialization} &bull; Room <strong className="text-indigo-401 font-mono">{track.room_number}</strong>
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-[8px] font-bold text-slate-500 uppercase block font-mono">My Wait Token</span>
                                <div className="text-xl font-black font-mono text-indigo-400">
                                  #{track.queue_number}
                                </div>
                              </div>
                            </div>

                            {/* Big wait details */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800 mt-3 text-center">
                              <div>
                                <span className="text-[9px] text-slate-500 block font-semibold uppercase font-mono">Estimated Waiting</span>
                                <span className="text-xs font-bold text-indigo-305 font-mono mt-0.5 block">
                                  {isDone ? "Completed Exam" : isCancelled ? "Cancelled" : `${track.estimated_wait_time} mins`}
                                </span>
                              </div>

                              <div>
                                <span className="text-[9px] text-slate-500 block font-semibold uppercase font-mono">Ahead in Waitlist</span>
                                <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                                  {isDone ? 0 : isCancelled ? 0 : `${track.people_ahead} patients`}
                                </span>
                              </div>
                            </div>

                            {/* Servicing info */}
                            {!isDone && !isCancelled && (
                              <div className="mt-3 py-1.5 px-2.5 bg-indigo-950/80 border border-indigo-900 text-[10.5px] rounded-lg text-slate-350 flex items-center justify-between">
                                <span>Presently inside room:</span>
                                <span className="font-bold font-mono text-emerald-400">
                                  {track.current_patient_number > 0 
                                    ? `Queue #${track.current_patient_number} (${track.current_patient_name})`
                                    : `None`}
                                </span>
                              </div>
                            )}

                            {/* Status block Footer */}
                            <div className="flex items-center justify-between mt-3 text-[10.5px] pt-2 border-t border-slate-800/65">
                              <span className="text-slate-500 font-semibold uppercase">Consultation Status</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                isWaiting 
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                                  : isConsulting 
                                    ? "bg-indigo-600 text-white border-indigo-500"
                                    : isCancelled
                                      ? "bg-rose-500/15 text-rose-450 border-rose-500/30"
                                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              }`}>
                                {track.queue_status === "Waiting" && "Waiting in lobby"}
                                {track.queue_status === "In Consultation" && "🩺 Active Check-in"}
                                {track.queue_status === "Completed" && "Done"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sristi Cares Information guide */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2.5 shadow-xs">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block font-mono">Patient Guidelines &amp; Reminders</span>
                  <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4.5 leading-relaxed font-medium">
                    <li>The live wait dashboard refreshes in real-time instantly across browsers as doctor desk acts.</li>
                    <li>Arrive at least 10 minutes prior to your estimated call time inside Room corridors.</li>
                    <li>Should you miss your name call turn, the doctor will flag you as absent and advance queue triage.</li>
                  </ul>
                </div>

              </div>

            </div>

            {/* MEDICAL RECORDS DASHBOARD COMPONENT */}
            <div className="bg-white rounded-2xl border border-slate-205 shadow-xs overflow-hidden mt-6" id="patient-medical-records-panel">
              <div className="border-b border-slate-100 p-5 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-50 text-teal-650 rounded-lg">
                      <BookOpen className="h-4 w-4 stroke-2" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">My Medical Records &amp; Transcripts</h3>
                  </div>
                  <p className="text-[11px] text-slate-455 font-medium">
                    Verified clinical summaries, vitals, prescriptions, and physician notes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddRecordForm(!showAddRecordForm)}
                  className="px-3.5 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showAddRecordForm ? "Close Log Form" : "Log Consultation Record"}
                </button>
              </div>

              {/* Form to manual register self-reported / previous checkup record */}
              {showAddRecordForm && (
                <div className="p-5 border-b border-slate-100 bg-slate-50/40 animate-fade-in space-y-4">
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wide">
                    Log Previous / Self-reported Consultation Transcript
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Attending Physician Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Jane Doe"
                        value={newRecDoctor}
                        onChange={(e) => setNewRecDoctor(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Clinical Specialty</label>
                      <input
                        type="text"
                        placeholder="e.g. General Medicine"
                        value={newRecSpecialty}
                        onChange={(e) => setNewRecSpecialty(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Consultation Date</label>
                      <input
                        type="date"
                        value={newRecDate}
                        onChange={(e) => setNewRecDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800 cursor-pointer"
                      />
                    </div>

                    <div className="md:col-span-12">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Diagnosis Summary / Chief Complaint</label>
                      <input
                        type="text"
                        placeholder="e.g. Acute sore throat accompanied by dry cough"
                        value={newRecSummary}
                        onChange={(e) => setNewRecSummary(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Vitals: Blood Pressure</label>
                      <input
                        type="text"
                        placeholder="e.g. 120/80"
                        value={newRecBP}
                        onChange={(e) => setNewRecBP(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Vitals: Pulse Rate (bpm)</label>
                      <input
                        type="text"
                        placeholder="e.g. 72"
                        value={newRecPulse}
                        onChange={(e) => setNewRecPulse(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Vitals: Temperature (°F)</label>
                      <input
                        type="text"
                        placeholder="e.g. 98.6"
                        value={newRecTemp}
                        onChange={(e) => setNewRecTemp(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                      />
                    </div>

                    <div className="md:col-span-12">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Doctor's Notes &amp; Clinical Remarks</label>
                      <textarea
                        rows={3}
                        placeholder="Enter the medical advice, diagnostic observations, or recommended therapeutics/prescriptions..."
                        value={newRecNotes}
                        onChange={(e) => setNewRecNotes(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800 leading-relaxed"
                      />
                    </div>

                    <div className="md:col-span-12 flex justify-end gap-2 pt-1 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newRecSummary || !newRecNotes || !newRecDoctor) {
                            triggerBannerAlert("Please specify physician name, diagnosis summary, and doctor remarks.");
                            return;
                          }
                          const newRecord = {
                            record_id: `rec-${Date.now()}`,
                            patient_id: patientProfile.patient_id,
                            doctor_name: newRecDoctor,
                            specialization: newRecSpecialty,
                            date: newRecDate,
                            summary: newRecSummary,
                            notes: newRecNotes,
                            vitals: {
                              bp: newRecBP.includes("mmHg") ? newRecBP : `${newRecBP} mmHg`,
                              pulse: newRecPulse.includes("bpm") ? newRecPulse : `${newRecPulse} bpm`,
                              temp: newRecTemp.includes("°F") ? newRecTemp : `${newRecTemp} °F`
                            },
                            status: "Self-Reported"
                          };
                          setMedicalRecords([newRecord, ...medicalRecords]);
                          setNewRecSummary("");
                          setNewRecNotes("");
                          setShowAddRecordForm(false);
                          triggerBannerAlert("New personal clinical record logged successfully!");
                        }}
                        className="py-2 px-5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs"
                      >
                        Insert Record
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List Section */}
              <div className="p-5">
                {medicalRecords.filter((rec) => rec.patient_id === patientProfile.patient_id).length === 0 ? (
                  <div className="text-center py-10 px-4 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <BookOpen className="h-8 w-8 stroke-1 text-teal-555 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700">No Historical Records Found</h4>
                    <p className="text-[11px] leading-relaxed max-w-sm mx-auto text-slate-455 font-medium">
                      There are currently no previous consultation logs associated with this patient account ({patientProfile.name}). Use the button above to log a previous consultation summary, or attend live clinical consultations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicalRecords
                      .filter((rec) => rec.patient_id === patientProfile.patient_id)
                      .map((rec) => (
                        <div key={rec.record_id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/10 hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 font-bold">
                                🗓️ {rec.date}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold tracking-widest uppercase border ${
                                rec.status === "Finalized"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-purple-50 text-purple-700 border-purple-100"
                              }`}>
                                {rec.status || "Self-Reported"}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-sm text-slate-800 tracking-tight leading-snug">{rec.summary}</h4>
                              <p className="text-[11px] font-semibold text-slate-500">
                                Attending: <strong className="text-slate-700 font-bold">{rec.doctor_name}</strong> ({rec.specialization})
                              </p>
                            </div>

                            {/* Vitals metrics */}
                            <div className="bg-white px-3 py-2 rounded-lg border border-slate-100 grid grid-cols-3 gap-2 text-center">
                              <div>
                                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider font-mono">B.P.</span>
                                <span className="text-[10px] font-mono font-extrabold text-slate-700">{rec.vitals?.bp || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Pulse</span>
                                <span className="text-[10px] font-mono font-extrabold text-slate-700">{rec.vitals?.pulse || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Temp</span>
                                <span className="text-[10px] font-mono font-extrabold text-slate-700">{rec.vitals?.temp || "N/A"}</span>
                              </div>
                            </div>

                            {/* Notes body */}
                            <div className="bg-amber-50/20 border border-amber-100/30 p-3 rounded-lg text-slate-650 text-xs leading-relaxed space-y-1">
                              <span className="text-[8.5px] font-mono text-amber-700 uppercase font-black tracking-wide block">Physician Remarks:</span>
                              <p className="font-medium text-slate-600">{rec.notes}</p>
                            </div>
                          </div>

                          {/* Card footer */}
                          <div className="pt-2 border-t border-slate-100/70 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                            <span>Clinical Record Secured</span>
                            <span className="font-semibold text-slate-350">Verified Sristi Cares</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        )}

        {/* ========================================================== */}
        {/* VIEW 4: SIMPLIFIED DOCTORS DESK WORKSPACE */}
        {/* ========================================================== */}
        {activeRoleMode === "doctor" && (
          <div className="space-y-6 animate-fade-in" id="active-doctor-session">
            
            <div className="bg-gradient-to-r from-amber-600 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center md:text-left">
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/35 rounded-full text-[9px] font-mono tracking-widest text-amber-205 uppercase font-bold">
                  Clinical Workspace
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                  <Stethoscope className="h-5 w-5 text-amber-400" />
                  Welcome Doctor: {doctors.find((d) => d.doctor_id === activeDoctorPortalId)?.name || 'Physician'}
                </h2>
                <div className="text-[10.5px] text-slate-350 space-x-1 font-medium font-mono">
                  <span>ACTIVE DESK: <strong>{doctors.find((d) => d.doctor_id === activeDoctorPortalId)?.specialization || 'General'}</strong></span>
                  <span>&bull;</span>
                  <span>Room {doctors.find((d) => d.doctor_id === activeDoctorPortalId)?.room_number || 'Room 101'}</span>
                  <span>&bull;</span>
                  <span>Timings: {doctors.find((d) => d.doctor_id === activeDoctorPortalId)?.availability || '09:00 AM - 05:00 PM'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activeDoctorPortalId}
                  onChange={(e) => setActiveDoctorPortalId(e.target.value)}
                  className="text-xs px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl outline-none font-bold cursor-pointer hover:bg-slate-750"
                >
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setActiveRoleMode("landing");
                    triggerBannerAlert("Exited Doctors Console.");
                  }}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Back Home
                </button>
              </div>
            </div>

            {/* Quick Live Simulator deck inline for easy interactive testing */}
            <div className="bg-slate-900 text-slate-200 p-4.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Simulate Queue Testing
                </h4>
                <p className="text-[11px] text-slate-400">
                  Quickly append simulated patient appointments into your current queue list to test real-time wait tracker changes!
                </p>
              </div>
              <button
                onClick={handleSimulateQueue}
                className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Inject Simulated Patient Booking
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Doctor active queue worklist */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-205 shadow-xs overflow-hidden">
                  <div className="border-b border-slate-105 p-4.5 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                      Today's Consultation Waitlist Triage
                    </h3>
                    <span className="text-[10.5px] font-bold font-mono text-indigo-705 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-0.5">
                      {doctorQueue.length} Waitlist Entries
                    </span>
                  </div>

                  {doctorQueue.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <Activity className="w-8 h-8 text-indigo-405 animate-pulse mx-auto" />
                      <h4 className="font-semibold text-xs text-slate-600">Your consult waitlist is empty right now</h4>
                      <p className="text-[11px] text-slate-450 max-w-sm mx-auto leading-relaxed">
                        Use the Simulator button above to append a simulated patient, or enter the Patient Portal to register appointment tokens.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                      {doctorQueue.map((item) => {
                        const patRec = patients.find((p) => p.patient_id === item.patient_id);
                        const isWaiting = item.queue_status === "Waiting";
                        const isConsulting = item.queue_status === "In Consultation";
                        const isDone = item.queue_status === "Completed";
                        
                        return (
                          <div 
                            key={item.queue_id}
                            className={`p-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                              isConsulting ? "bg-emerald-50/40" : ""
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold font-mono text-indigo-605 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full inline-block">
                                Wait Token #{item.queue_number}
                              </span>
                              
                              <h4 className="font-bold text-[13.5px] text-slate-800">
                                {patRec ? patRec.name : "Guest Patient"}
                              </h4>

                              <div className="text-[11px] text-slate-500 font-medium space-x-1">
                                <span>Age: {patRec ? patRec.age : "25"}</span>
                                <span>&bull;</span>
                                <span>Gender: {patRec ? patRec.gender : "Male"}</span>
                                <span>&bull;</span>
                                <span>Contact: {patRec ? patRec.phone : "TBA"}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:self-center">
                              {isWaiting && (
                                <button
                                  onClick={() => handleQueueAction(item.queue_id, "start")}
                                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors"
                                >
                                  🩺 Meet Patient
                                </button>
                              )}

                              {isConsulting && (
                                <button
                                  onClick={() => handleQueueAction(item.queue_id, "complete")}
                                  className="py-1.5 px-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[10.5px] font-extrabold uppercase tracking-wide cursor-pointer animate-pulse transition-all"
                                >
                                  ✅ Fin Consult
                                </button>
                              )}

                              {!isDone && (
                                <button
                                  onClick={() => handleQueueAction(item.queue_id, "skip")}
                                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-lg text-[10.5px] font-semibold uppercase cursor-pointer"
                                  title="Mark caller absent"
                                >
                                  Skip Turn
                                </button>
                              )}

                              {isDone && (
                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 border border-slate-200 py-1 px-2.5 rounded-md">
                                  ✓ Concluded
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor sidebar tips & information */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-205 shadow-xs p-5 space-y-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block font-mono">Triage Operational Ticker</span>
                  
                  <div className="space-y-3 text-xs text-slate-500 leading-relaxed font-semibold">
                    <p>
                      <strong>🩺 Meet Patient</strong>: Pushes status of this patient wait token to consulting, changing public status tickers.
                    </p>
                    <p>
                      <strong>✅ Fin Consult</strong>: Concludes examination diagnostics, recording stats as successfully completed.
                    </p>
                    <p>
                      <strong>Skip Turn</strong>: Flags patients as absent. Pushes queue sequence to next wait token entries.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-5 space-y-2 text-slate-700">
                  <h4 className="text-[11px] font-extrabold text-amber-800 uppercase block tracking-wider">Clinical Cleanliness Standard</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Ensure sanitized treatment desk, clean testing scopes, and secure room hygiene checks at each consultation milestone. Return files to primary archive records upon conclusion.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 5: SIMPLIFIED HOSPITAL ADMIN PORTAL */}
        {/* ========================================================== */}
        {activeRoleMode === "admin" && (
          <div className="space-y-6 animate-fade-in" id="active-admin-session">
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center md:text-left">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/35 rounded-full text-[9px] font-mono tracking-widest text-indigo-305 uppercase font-bold">
                  Management Console (Administrative Rights)
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                  <ShieldAlert className="h-5 w-5 text-indigo-400" />
                  Sristi Administrative Desk
                </h2>
                <span className="text-[10.5px] text-slate-350 font-mono block">SYSTEM SECURITY CONTROL ESTABLISHED</span>
              </div>

              <button
                onClick={() => {
                  setActiveRoleMode("landing");
                  triggerBannerAlert("Administrator Signed Out.");
                }}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Admin Panel
              </button>
            </div>

            {/* System Performance stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="admin-kpi-row">
              
              <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-2xs text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Booked Log</span>
                <span className="text-2xl font-black text-slate-800 font-mono mt-0.5 block">{stats.total_appointments}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-2xs text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Completed Consults</span>
                <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">{stats.completed_consultations}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-2xs text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Staff roster listing</span>
                <span className="text-2xl font-black text-indigo-600 font-mono mt-0.5 block">{doctors.length} Doctors</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-2xs text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Waitlist Today</span>
                <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">{stats.waiting_patients} waiting</span>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Adding new Doctors Specialists form, very clean */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Building className="h-4 w-4 text-indigo-650" />
                    <h3 className="font-extrabold text-sm text-slate-800">Configure Doctor Specialist</h3>
                  </div>

                  <form onSubmit={handleAddDoctor} className="space-y-4">
                    <div>
                      <label className="text-[10.5px] font-bold text-slate-450 block uppercase mb-1">Doctor Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Kavita Saini"
                        value={adminDocName}
                        onChange={(e) => setAdminDocName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 outline-none rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-455 block uppercase mb-1">Clinical Speciality</label>
                        <select
                          value={adminDocSpecialty}
                          onChange={(e) => setAdminDocSpecialty(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold"
                        >
                          <option value="General Medicine">General Medicine</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Dermatology">Dermatology</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Gynaecology">Gynaecology</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10.5px] font-bold text-slate-455 block uppercase mb-1">Experience Years</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 12"
                          value={adminDocExp}
                          onChange={(e) => setAdminDocExp(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-455 block uppercase mb-1">Room Assignment</label>
                        <input
                          type="text"
                          required
                          placeholder="Room 205"
                          value={adminDocRoom}
                          onChange={(e) => setAdminDocRoom(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-bold text-slate-455 block uppercase mb-1">Shift Hours</label>
                        <input
                          type="text"
                          required
                          placeholder="09:00 AM - 05:00 PM"
                          value={adminDocTime}
                          onChange={(e) => setAdminDocTime(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 shadow-sm hover:bg-slate-950 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-indigo-400" />
                      Add Specialist To Roster
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Side: Active Medical Roster Table listing with remove option */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                      Active Medical Staff Listing
                    </span>
                    <span className="text-[10.5px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg font-mono">
                      {doctors.length} Physicians
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {doctors.map((d) => (
                      <div 
                        key={d.doctor_id} 
                        className="p-3 border border-slate-200 bg-slate-50/40 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-850 text-sm">{d.name}</h4>
                          <p className="text-[11px] text-indigo-650 font-semibold">
                            {d.specialization} &bull; Assignment: Room {d.room_number || "101"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Hours: {d.availability || "09:00 AM - 05:00 PM"} | Experience: {d.experience} Years
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteDoctor(d.doctor_id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                          title="Remove Doctor Profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Hospital Footer copyright */}
      <footer className="bg-slate-900 border-t border-slate-800 text-center py-6 text-xs text-slate-500 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-bold text-slate-400">Sristi Cares Professional Healthcare CRM Gateway</p>
          <p className="max-w-lg mx-auto text-[11.5px] text-slate-500 leading-relaxed font-sans">
            Designed for secure clinical management and transparent waitlist token tracking. Simulated queue states update all connected terminals in real-time.
          </p>
          <p className="text-[9.5px] text-slate-500 font-mono mt-3">
            &copy; 2026 Sristi Cares Inc. &bull; Secure HIPAA Compliance Architecture Setup.
          </p>
        </div>
      </footer>

    </div>
  );
}

// Inline support component for visual user action iconography
function UserCheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
