// mock/data.ts
import { FullPatientProfile, PatientCardData, PatientDetailData } from '../types';

// 1. THIS BUILDS THE 6-BOX DASHBOARD (The Array)
export const mockDashboardData: PatientCardData[] = [
  {
    opNumber: "O10045",
    patientName: "Rajesh Kumar",
    procedureName: "MRI Guided Biopsy",
    scheduledDate: "2026-05-20",
    status: "missed"
  },
  {
    opNumber: "O10082",
    patientName: "Lakshmi S.",
    procedureName: "Chemotherapy Cycle 1",
    scheduledDate: "2026-05-15",
    status: "missed" 
  },
  {
    opNumber: "O10103",
    patientName: "Arun Patel",
    procedureName: "PET Scan",
    scheduledDate: "2026-05-10",
    status: "completed"
  },
  {
    opNumber: "O10155",
    patientName: "Meena M.",
    procedureName: "Surgical Excision",
    scheduledDate: "2026-05-22",
    status: "upcoming"
  }
];

// 2. THIS SHOWS THE DETAILS WHEN A DOCTOR CLICKS A BOX (The Dictionary)
export const mockPatientDetails: Record<string, PatientDetailData> = {
  "OP-10045": {
    opNumber: "O10045",
    patientName: "Rajesh Kumar",
    procedureName: "MRI Guided Biopsy",
    scheduledDate: "2026-05-20",
    status: "missed",
    tumorBoardNotes: "Suspicious mass in right lobe. Recommend immediate MRI guided biopsy to confirm malignancy. Patient has a history of hypertension, monitor BP during procedure.",
    lastUpdated: "2026-05-18T10:00:00Z"
  },
  "OP-10082": {
    opNumber: "O10082",
    patientName: "Lakshmi S.",
    procedureName: "Chemotherapy Cycle 1",
    scheduledDate: "2026-05-15",
    status: "missed",
    tumorBoardNotes: "Start Cycle 1 of standard systemic chemotherapy. Needs premedication for nausea. If patient misses the date, follow up immediately to reschedule.",
    lastUpdated: "2026-05-10T14:30:00Z"
  },
  "OP-10103": {
    opNumber: "O10103",
    patientName: "Arun Patel",
    procedureName: "PET Scan",
    scheduledDate: "2026-05-10",
    status: "completed",
    tumorBoardNotes: "Post-surgical follow-up PET scan required to check for any residual metastatic activity before clearing for discharge.",
    lastUpdated: "2026-05-11T09:15:00Z"
  },
  "OP-10155": {
    opNumber: "O10155",
    patientName: "Meena M.",
    procedureName: "Surgical Excision",
    scheduledDate: "2026-05-22",
    status: "upcoming",
    tumorBoardNotes: "Scheduled for localized surgical excision. Pre-op blood work required 48 hours prior to the procedure date.",
    lastUpdated: "2026-05-17T16:45:00Z"
  }
};
// mock/data.ts (Add this to the bottom of the existing file)

export const mockLoggedInPatient: FullPatientProfile = {
  opNumber: "O10045",
  name: "Rajesh Kumar",
  phoneNumber: "+91 98765 43210",
  address: "123 Anna Salai, Chennai, Tamil Nadu 600002",
  history: [
    { 
      id: "proc-1", 
      procedureName: "MRI Guided Biopsy", 
      scheduledDate: "2026-05-20", 
      status: "upcoming", 
      tumorBoardNotes: "Suspicious mass in right lobe. Recommend immediate MRI guided biopsy to confirm malignancy." 
    },
    { 
      id: "proc-2", 
      procedureName: "Initial Oncology Consult", 
      scheduledDate: "2026-04-12", 
      status: "completed", 
      tumorBoardNotes: "Patient reported localized pain. Ordered preliminary bloodwork and scans." 
    }
  ],
  notifications: [
    { 
      id: "notif-1", 
      title: "Upcoming Procedure Reminder", 
      message: "You have an MRI Guided Biopsy scheduled for May 20th. Please arrive 30 minutes early.", 
      date: "2026-05-18T08:00:00Z" 
    },
    { 
      id: "notif-2", 
      title: "EMR Updated", 
      message: "Your procedure 'Initial Oncology Consult' was marked as completed by your doctor.", 
      date: "2026-04-13T10:30:00Z" 
    }
  ]
};