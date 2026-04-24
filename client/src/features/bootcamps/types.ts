export interface Bootcamp {
  _id?: string;
  name: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  instructor: { _id: string; name: string; email: string } | null;
  division: { _id: string; name: string } | string;
  creator: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Session {
  _id: string;
  bootcamp: string;
  title: string;
  description?: string;
  location?: string;
  onlineLink?: string;
  startTime: string;
  endTime: string;
  instructor: { _id: string; name: string } | null;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  bootcamp: string;
  leader?: string;
  members: { _id: string; name: string; email: string }[];
  createdAt: string;
}

export interface Task {
  _id: string;
  bootcamp: string;
  session: string;
  title: string;
  description: string;
  deadline: string;
  status: 'active' | 'inactive';
  allowedTypes: string[];
  formLink?: string;
  allowLateSubmission: boolean;
  maxScore: number;
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  externalLink?: string;
  type: 'pdf' | 'video' | 'image' | 'zip' | 'link';
  session?: string;
  bootcamp?: string;
  downloads: number;
  uploadedBy: { _id: string; name: string };
}

export interface Attendance {
  _id: string;
  student: { _id: string; name: string; email: string };
  session: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
  markedAt: string;
}

export interface InstructorAssignment {
  _id: string;
  instructor: { _id: string; name: string; email: string };
  bootcamp: string;
  permissions: ('manage_attendance' | 'upload_resources' | 'create_tasks' | 'grade_submissions' | 'view_feedback')[];
  status: 'active' | 'expired' | 'revoked';
  startDate: string;
  endDate: string;
}

export interface Feedback {
  _id: string;
  session: string;
  student: { _id: string; name: string; email: string };
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
} 