import { Component } from '@angular/core';
import { App, LoadingController, NavController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ApiProvider } from '../../providers/api/api';
declare var ExoPlayer;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public loader: any;
  public channels = [];
  public channellistall = [];
  halaman = 0;
  public load: any;

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public app: App,
    public loadingCtrl: LoadingController,
    private screenOrientation: ScreenOrientation) {
    this.load = ''
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
    });
    this.loader.present().then(() => {
      this.doGetList()
    });
  }
  doGetList() {
    return new Promise(resolve => {
      let offset = 5 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("table/z_list_channel", { params: { filter: "status='OPEN' AND category='STREAM'", offset: offset, limit: 5, sort: "name" + " ASC " } })
          .subscribe(val => {
            let data = val['data']
            for (let i = 0; i < data.length; i++) {
              this.channellistall.push(data[i]);
              this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN' AND name=" + "'" + data[i].name + "'", limit: 10, sort: "date" + " DESC " } })
                .subscribe(val => {
                  let data = val['data']
                  for (let i = 0; i < data.length; i++) {
                    this.channels.push(data[i]);
                  }
                });
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            setTimeout(() => {
              this.load = 'OK'
            }, 2000)
            resolve(val)
          }, err => {
            this.doGetList();
          });
      }
    });
  }
  ngAfterViewInit() {
    this.loader.dismiss()
  }
  doInfinite(infiniteScroll) {
    this.doGetList().then(response => {
      infiniteScroll.complete();
    });
  }
  doPreview(channeldetail) {
    this.navCtrl.push('PreviewPage', {
      channeldetail: channeldetail
    })
  }
  doPage(val) {
    this.navCtrl.push(val)
  }
  doRootPage() {
    this.app.getRootNav().setRoot(HomePage)
  }
  doDetail(channel) {
    this.navCtrl.push('DetailPage', {
      channel: channel
    })
  }
}
