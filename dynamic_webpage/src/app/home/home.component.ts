import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = 'dynamic_webpage';
  domains: string[] = ['Backend', 'Frontend', 'System Design', 'OOPS']; // Sample names array
  domainToStacks: { [key: string]: string[] } = {
    'Backend': ['Node.js', 'Python', 'Java', 'Ruby'],
    'Frontend': ['Angular', 'React', 'Vue.js'],
    'System Design': ['Scalability', 'Reliability', 'Performance'],
    'OOPS': ['Inheritance', 'Polymorphism', 'Abstraction', 'Encapsulation']
  };
  
  selectedDomain: string = '';
  selectedStack: string = '';

  constructor(private router: Router) { }
  onDomainSelect() {
    console.log('Selected domain:', this.selectedDomain);
    // this.router.navigate(['/domain',this.selectedStack]);
  }
  onStackSelect() {
    console.log('Selected stack:', this.selectedStack);
    this.router.navigate(['/domain',this.selectedStack]);
  }
}


