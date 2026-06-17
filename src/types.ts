/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  patient_id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
}

export interface Doctor {
  doctor_id: string;
  name: string;
  specialization: string;
  experience: number; // in years
  availability: string; // e.g., "09:00 AM - 05:00 PM"
  room_number: string;
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface QueueEntry {
  queue_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  queue_number: number;
  queue_status: 'Waiting' | 'In Consultation' | 'Completed' | 'Skipped';
  estimated_wait_time: number; // in minutes
  created_at: string;
}

export interface SystemStats {
  total_appointments: number;
  completed_consultations: number;
  waiting_patients: number;
  cancelled_appointments: number;
}
