import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../model/task/task.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  taskForm: FormGroup;
  searchForm: FormGroup;
  filterForm: FormGroup;
  editingTask: Task | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  username: string | null = null;
  showFilters = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      dueDate: [null]
    });

    this.searchForm = this.formBuilder.group({
      searchQuery: ['']
    });

    this.filterForm = this.formBuilder.group({
      status: [''],
      priority: [null],
      fromDate: [null],
      toDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.username = this.authService.getUsername();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.tasks = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar tareas';
        }
      },
      error => {
        this.isLoading = false;
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = error.error?.message || 'Error al conectar con el servidor';
        }
      }
    );
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const taskData = this.taskForm.value;

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, {
        ...taskData,
        status: this.editingTask.status
      }).subscribe(
        response => {
          this.handleTaskResponse(response, 'Tarea actualizada con éxito');
        },
        error => this.handleTaskError(error)
      );
    } else {
      this.taskService.createTask(taskData).subscribe(
        response => {
          this.handleTaskResponse(response, 'Tarea creada con éxito');
        },
        error => this.handleTaskError(error)
      );
    }
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null
    });
  }

  cancelEdit(): void {
    this.editingTask = null;
    this.resetForm();
  }

  resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 1,
      dueDate: null
    });
  }

  deleteTask(taskId: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.deleteTask(taskId).subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.successMessage = 'Tarea eliminada con éxito';
        } else {
          this.errorMessage = response.message || 'Error al eliminar la tarea';
        }
      },
      error => this.handleTaskError(error)
    );
  }

  updateTaskStatus(task: Task, newStatus: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.updateTask(task.id, { 
      title: task.title,
      description: task.description,
      status: newStatus,
      priority: task.priority,
      dueDate: task.dueDate
    }).subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          const index = this.tasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            this.tasks[index] = response.data;
          }
          this.successMessage = 'Estado de tarea actualizado';
        } else {
          this.errorMessage = response.message || 'Error al actualizar el estado';
        }
      },
      error => this.handleTaskError(error)
    );
  }

  searchTasks(): void {
    const query = this.searchForm.get('searchQuery')?.value;
    if (!query || query.trim() === '') {
      this.loadTasks();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.searchTasks(query).subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.tasks = response.data;
        } else {
          this.errorMessage = response.message || 'Error al buscar tareas';
        }
      },
      error => this.handleTaskError(error)
    );
  }

  filterTasks(): void {
    const status = this.filterForm.get('status')?.value;
    const priority = this.filterForm.get('priority')?.value;
    const fromDate = this.filterForm.get('fromDate')?.value ? new Date(this.filterForm.get('fromDate')?.value) : undefined;
    const toDate = this.filterForm.get('toDate')?.value ? new Date(this.filterForm.get('toDate')?.value) : undefined;

    if (!status && !priority && !fromDate && !toDate) {
      this.loadTasks();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.filterTasks(status, priority, fromDate, toDate).subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.tasks = response.data;
        } else {
          this.errorMessage = response.message || 'Error al filtrar tareas';
        }
      },
      error => this.handleTaskError(error)
    );
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      priority: null,
      fromDate: null,
      toDate: null
    });
    this.loadTasks();
  }

  resetSearch(): void {
    this.searchForm.reset({
      searchQuery: ''
    });
    this.loadTasks();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private handleTaskResponse(response: any, successMessage: string): void {
    this.isLoading = false;
    if (response.success) {
      this.loadTasks();
      this.successMessage = successMessage;
      this.resetForm();
      this.editingTask = null;
    } else {
      this.errorMessage = response.message || 'Error en la operación';
    }
  }

  private handleTaskError(error: any): void {
    this.isLoading = false;
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    } else {
      this.errorMessage = error.error?.message || 'Error al conectar con el servidor';
    }
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'priority-low';
      case 2: return 'priority-medium-low';
      case 3: return 'priority-medium';
      case 4: return 'priority-medium-high';
      case 5: return 'priority-high';
      default: return 'priority-low';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return 'Pendiente';
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'No establecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }
}