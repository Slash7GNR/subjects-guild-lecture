import { Injectable } from '@angular/core';
import { TodosHttpService } from '../services/todos-http.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TodoItem } from '../../shared/models/todo.models';
import { finalize, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoStateService {
  private loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private addTodoLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private addTodoSuccess: Subject<void> = new Subject<void>();
  private todos: BehaviorSubject<TodoItem[]> = new BehaviorSubject<TodoItem[]>(null);
  private todosLoadingFailed: Subject<void> = new Subject<void>();

  public loading$: Observable<boolean> = this.loading.asObservable();
  public addTodoLoading$: Observable<boolean> = this.addTodoLoading.asObservable();
  public addTodoSuccess$: Observable<void> = this.addTodoSuccess.asObservable();
  public todos$: Observable<TodoItem[]> = this.todos.asObservable();

  constructor(private todoHttp: TodosHttpService) { }

  public loadTodos(): void {
    this.loading.next(true);

    this.todoHttp.getTodos()
      .pipe(finalize(() => {
        this.loading.next(false);
      }))
      .subscribe((items: TodoItem[]) => {
        this.todos.next(items);
      }, () => {
        this.todosLoadingFailed.next();
      });
  }

  // public toggleTodoItem(todoItem: TodoItem): void {
  //   this.todoHttp.toggleTodoItem(todoItem)
  //     .pipe(switchMap(() => this.todoHttp.getTodos()))
  //     .subscribe((todoItems: TodoItem[]) => {
  //       this.todos.next(todoItems);
  //     });
  // }

  public addTodo(text: string): void {
    this.addTodoLoading.next(true);
    const currentTodos = this.todos.getValue();
    const latestIndex = Math.max(...currentTodos.map((todo: TodoItem) => Number(todo.id)));
    const todoItem = {
      done: false,
      task: text,
      id: (latestIndex + 1).toString()
    } as TodoItem;
    this.todoHttp.addTodo(todoItem)
      .pipe(finalize(() => this.addTodoLoading.next(false)))
      .subscribe(() => {
        this.addTodoSuccess.next();
        this.todos.next([...this.todos.getValue(), todoItem]);
      });
  }

  public toggleTodoItem(todoItem: TodoItem): void {
    this.todoHttp.toggleTodoItem(todoItem);
    const currentTodos = this.todos.getValue();
    const currentTodoItem = currentTodos.find((item: TodoItem) => todoItem.id === item.id);

    if (currentTodoItem) {
      const index = currentTodos.indexOf(currentTodoItem);
      currentTodos[index] = {
        ...currentTodoItem,
        done: !currentTodoItem.done
      };
      this.todos.next([...currentTodos]);
    }
  }
}
