import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-preview',
  templateUrl: 'preview.html',
})
export class PreviewPage {

  public trailer: any;
  public channeldetail: any;
  public genres = [];
  public channels = [];
  public query: any;
  public load = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider) {
    this.channeldetail = this.navParams.get('channeldetail')
    let trailersubs = this.channeldetail.trailer.substring(32, 60)
    this.trailer = trailersubs
    var array = this.channeldetail.imdb_genre.split(", ");
    this.genres = array
    var query = [];
    for(let i = 0;i < this.genres.length;i++) {
      query.push(" AND imdb_genre LIKE '%"+ this.genres[i] + "%'")
    }
    this.query = query.toString()
    for(let i = 0;i < this.genres.length;i++) {
      this.query = this.query.replace(',', '')
    }
    this.doGetRecommended()
  }
  doBack() {
    this.navCtrl.pop()
  }
  doGetRecommended() {
    this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN'" + this.query, limit: 10, sort: "click" + " DESC " } })
    .subscribe(val => {
      this.channels = val['data']
      this.load = 'OK'
    }, err => {
      this.doGetRecommended()
    });
  }

}
