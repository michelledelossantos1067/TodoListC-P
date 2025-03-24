export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}