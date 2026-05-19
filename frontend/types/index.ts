// types/index.ts

// Define the exact statuses a procedure can have
export type ProcedureStatus = 'upcoming' | 'completed' | 'missed';

// The full patient profile
export interface Patient {
  opNumber: string;
  name: string;
  phoneNumber: string;
  age: number;
}

// The specific data needed just for the Doctor's 6-Box Grid
export interface PatientCardData {
  opNumber: string;
  patientName: string;
  procedureName: string;
  scheduledDate: string; // Format: YYYY-MM-DD
  status: ProcedureStatus;
}

// The detailed data for when the doctor clicks a specific patient box
export interface PatientDetailData extends PatientCardData {
  tumorBoardNotes: string;
  lastUpdated: string;
}
// types/index.ts (Add this to the bottom of the existing file)

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
}

export interface PatientHistoryItem {
  id: string;
  procedureName: string;
  scheduledDate: string;
  status: ProcedureStatus;
  tumorBoardNotes: string;
}

export interface FullPatientProfile {
  opNumber: string;
  name: string;
  phoneNumber: string;
  address: string;
  history: PatientHistoryItem[];
  notifications: AppNotification[];
}