// frontend/types/voter.ts (Ubah nama atau bersihkan dpt.ts)
export interface Voter {
  id: number;
  nik: string;
  full_name: string;
  is_used: boolean;
  suffix_type: 'normal' | 'rejected_999' | 'warning_888';
}