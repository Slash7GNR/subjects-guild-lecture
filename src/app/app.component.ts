import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TodoStateService } from './core/states/todo-state.service';
import { TodoItem } from './shared/models/todo.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, fromEvent, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();

  @ViewChild('search', { static: true }) search: ElementRef;
  todosFiltered: Observable<TodoItem[]>;

  constructor(public todoState: TodoStateService, private snackbar: MatSnackBar) {
  }

  toggleStrike(todoItem: TodoItem): void {
    this.todoState.toggleTodoItem(todoItem);
  }

  ngOnInit(): void {
    this.todoState.loadTodos();

    this.subscriptions.add(
      this.todoState.addTodoSuccess$.subscribe(() => {
        this.snackbar.open('Todo item added successfully!');
      })
    );
    this.todosFiltered = fromEvent(this.search.nativeElement, 'input')
      .pipe(
        startWith(''),
        map(() => this.search.nativeElement.value as string),
        switchMap((searchValue: string) => {
          return this.todoState.todos$.pipe(map((items: TodoItem[]) => {
            if (!searchValue) {
              return items;
            }
            return items.filter((item: TodoItem) => item.task.indexOf(searchValue) > -1);
          }));
        })
      );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public addTodo(value: string): void {
    this.todoState.addTodo(value);
  }
}
