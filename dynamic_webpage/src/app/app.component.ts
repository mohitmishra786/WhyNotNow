import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dynamic_webpage';
  names: string[] = ['John', 'Doe', 'Alice', 'Bob']; // Sample names array
  selectedName: string = '';
  constructor(private router: Router) { }
  onSelect() {
    console.log('Selected name:', this.selectedName);
    this.router.navigate(['/other']);
  }
}
