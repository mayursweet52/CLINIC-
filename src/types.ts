export interface Appointment {
  id: number;
  patientName: string;
  doctor: string;
  date: string;
  time: string;
  status: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  contact: string;
  history: string;
}

export interface Medicine {
  id: number;
  name: string;
  stock: number;
  price: number;
}
