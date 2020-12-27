import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TodoItem } from '../../shared/models/todo.models';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodosHttpService {
  constructor(private http: HttpClient) { }

  public getTodos(): Observable<TodoItem[]> {
    return this.http.get('/assets/todos.json').pipe(map((todoResponse: any) => todoResponse as TodoItem[]), delay(2500));
  }

  toggleTodoItem(todoItem: TodoItem): Observable<any> {
    return of({}).pipe(delay(2000));
  }

  public addTodo(todoItem: TodoItem): Observable<any> {
    return of({}).pipe(delay(2000));
  }
}
