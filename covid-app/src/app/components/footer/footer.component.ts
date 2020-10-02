import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.sass']
})
export class FooterComponent implements OnInit {
  public links: Array<Object>;

  constructor() {
    this.links = [
      { text: "Accesibility", link: "" },
      { text: "Disclaimer", link: "" },
      { text: "Copyrights", link: "" },
      { text: "Privacy", link: "" }
    ]
  }

  ngOnInit(): void {
  }

}
