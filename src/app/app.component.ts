import { Component, OnInit, VERSION } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;
  resizedBase64: any;
  currentData: any;

  constructor() {}
  ngOnInit() {
    this.showCurrentTime();
  }

  showCurrentTime() {
    this.currentData = new Date();
    setTimeout(() => {
      this.showCurrentTime();
    }, 1000);
  }

  compressImage(src, newX, newY) {
    console.log(`${newX} x ${newY}`);
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const ctx = elem.getContext('2d');
        elem.width = newX;
        elem.height = newY;
        ctx.drawImage(img, 0, 0, newX, newY);
        const data = ctx.canvas.toDataURL();
        res(data);
      };
      img.onerror = (error) => rej(error);
    });
  }

  uploadImage(base64) {
    const $this = this;
    const i = new Image();
    i.onload = function () {
      var originalImg = $this.convertBase64ToFile(base64);
      console.log(originalImg.size);
      console.log(`${i.width} x ${i.height}`);
      $this
        // .compressImage(base64, 1920, 1920 * (i.height / i.width))
        .compressImage(base64, i.width, i.height)
        .then((compressed) => {
          // $this.resizedBase64 = compressed;
          var originalImgs = $this.convertBase64ToFile(compressed);
          console.log(originalImgs.size);
          const width = (i.width * 3000000) / originalImgs.size;
          $this
            .compressImage(base64, width, width * (i.height / i.width))
            .then((compressed) => {
              $this.resizedBase64 = compressed;
              var a = $this.convertBase64ToFile(compressed);
              console.log(a.size);
            });
        });
    };
    i.src = base64;
  }

  handleInputChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file.size > 1000000) {
      var pattern = /image-*/;
      var reader = new FileReader();
      if (!file.type.match(pattern)) {
        alert('invalid format');
        return;
      }
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsDataURL(file);
    } else {
      console.log('File valid');
    }
  }

  _handleReaderLoaded(e) {
    let reader = e.target;
    this.uploadImage(reader.result);
  }

  convertBase64ToFile(dataURI, fileName = 'fileName') {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ia], fileName, { type: mimeString });
  }
}
