import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from './playlist.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafeResourceUrl} from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {
  selectedName: string | undefined;
  videoUrl: string | undefined;
  playlistDetails: any;
  playlistItems: any[] | undefined;
  videoId: string | undefined;
  videoSrc: SafeResourceUrl|undefined;
  selectedVideos: string[] = [];

  nameToVideoUrlMap: { [key: string]: string } = {
    "John": 'dummy_Key',
    "Doe": 'dummy_Key',
    "Alice": 'dummy_Key',
    "Bob": 'dummy_Key',
  };

  constructor(private route: ActivatedRoute ,private playlistService: PlaylistService,private http: HttpClient,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.selectedName = params['name'];
      console.log('Received name:', this.selectedName);
      if (this.selectedName && this.nameToVideoUrlMap[this.selectedName]) {
        this.videoUrl = this.nameToVideoUrlMap[this.selectedName];
        console.log('Received name:', this.videoUrl);
      } else {
        this.videoUrl = undefined; // Handle case where name is not found
      }
    });
    this.fetchPlaylistData();
  }

  async fetchPlaylistData() {
    try {
      const response = await this.http.get<any>(`http://localhost:5000/playlist/${this.selectedName}`).toPromise();
      console.log(this.selectedName);
      this.playlistDetails = response.details;
      this.playlistItems = response.items;
      // console.log(this.playlistDetails);
      console.log(this.playlistItems);
    } catch (error) {
      console.error("Error fetching playlist data:", error);
      // Handle error
    }
  }
   
  playVideo(videoId: string): void {
    this.videoId = videoId;
    this.videoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  toggleVideo(event: Event, videoId: string): void {
    const target = event.target as HTMLInputElement | null; // Explicitly cast event.target to HTMLInputElement or null
    if (target && target instanceof HTMLInputElement && target.checked) { // Check if target is not null and is an HTMLInputElement
      // Add the videoId to the selectedVideos array
      this.selectedVideos.push(videoId);
    } else {
      // Remove the videoId from the selectedVideos array
      const index = this.selectedVideos.indexOf(videoId);
      if (index !== -1) {
        this.selectedVideos.splice(index, 1);
      }
    }
  }
  onPlayerReady(event: any) {
    console.log('Player is ready:', event);
  }

  onPlayerStateChange(event: any) {
    console.log('Player state changed:', event);
  }

  onPlayerError(event: any) {
    console.error('Player error:', event);
  }
  
}
