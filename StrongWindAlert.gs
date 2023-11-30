// 調べたい地域の緯度(latitude)・経度(longitude)を指定⇒GoogleMapを開き、地域を入力し、URL内@緯度,経度を取得する

//緯度(latitude)をここに入力
const latitude = 36.0720605;

//経度(longitude)をここに入力
const longitude = 137.6779845;


//(★トリガー設定必要)OPEN_WEATHERから1時間毎の風速を取得し、7.0m/s以上の時間帯があればGmailで通知を行う関数
function getFutureWindData() {
  // スクリプトプロパティに取得したAPIキーを呼び出す
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPEN_WEATHER_API_KEY');

  // 現在のUNIX時間を取得
  const currentTime = Math.floor(Date.now() / 1000);

  // 1~24時間後のUNIXリストを作成
  const unixList = [];


  for (let i=0; i<=86400; i+=3600){
    const futureTime = currentTime+i
    unixList.push(futureTime)
  }

  //1時間ごとの風速データ格納用(Gmail送付時使用)
  const futureHourlywindList = [];


  for (let v=0;v < unixList.length;v++){
  // One Call APIの取得
  const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${unixList[v]}&appid=${apiKey}`;
  const oneCallResponse = UrlFetchApp.fetch(oneCallUrl);
  const oneCallData = JSON.parse(oneCallResponse.getContentText());

  //1時間間隔の風速を取得
  const windData = oneCallData['data'][0]['wind_speed'];

  //時間を取得
  const timeData = new Date(unixList[v]*1000).getHours()+'時'

  //風速データを確認(現在～24時間後(1時間おき)で1タイミングでも7.0m/sを超えていたらメールを送付)
  futureHourlywindList.push([timeData,windData]);
  }

  //出力確認用(スクリプトから確認したい場合は以下の//を外す)
  //Logger.log(futureHourlywindList);

  //メール送信フラグを設置(Yes →　該当あり。メールを送る。No →　該当なし。メールを送らない)
  let sendFlag = 'No'

  for (let j=0;j<futureHourlywindList.length;j++){
    // 条件をチェックしてメールを送信するかどうか判断
    if (futureHourlywindList[j][1] >= 7.0) {
      sendFlag = 'Yes';
      break;
    } 
  }

  //sendFlagがtrueの場合メールを送る
  if(sendFlag==='Yes'){
    const sendGraphData = createGraph(futureHourlywindList)
    sendEmailTest(sendGraphData)
    Logger.log('メールを送信しました。')

  }else{
    Logger.log('強風は発生しない予報のため、メールは送信しませんでした。')
  }
  
}

//強風が発生する予報が出た場合、スプレッドシートにデータを書き込みグラフを作成する関数
function createGraph(list){
  //新しくシートを作成
  const newSs = SpreadsheetApp.create('風速データグラフ描画');

  //シート作成後にスクリプトプロパティにIDを記入する(後の削除のため)
  const sheetId = newSs.getId()
  PropertiesService.getScriptProperties().setProperty('NEWSHEET_ID',sheetId)

  //書き込むシートを選択
  const newSheet = newSs.getSheetByName('シート1');

  //実行日の日付を取得
  const today = new Date().toLocaleDateString('ja-JP')+'の風速予報(m/s)'


  //シートにデータを格納
  newSheet.getRange(1,1,list.length,list[0].length).setValues(list);

  //グラフの描画
  const dataRange = newSheet.getRange("A1:B25");

  const chart = newSheet.newChart().asLineChart()
                .addRange(dataRange)
                .setPosition(5,5,0,0)
                .setOption('title',today)
                .setOption('series',{0:{dataLabel:'value'}})
                .build();

  newSheet.insertChart(chart)

  //グラフを取得
  const sendChart = newSheet.getCharts()[0];

  const imageData = sendChart.getAs('image/png').getBytes();

  return imageData
}



//メールを送信する関数
function sendEmailTest(data) {
  // Gmailでメールを送信する処理を追加
  //スクリプトプロパティに自分のメールアドレスを保存
  const recipient = PropertiesService.getScriptProperties().getProperty('MY_MAILADDRESS'); // 送信先のメールアドレスを指定
  const today = new Date().toLocaleDateString('ja-JP');
  const subject = `強風発生のお知らせ(${today})`;//メールタイトルはここで変更
  const body = `24時間以内に7.0m/s以上の強風が発生する可能性があります。\n詳細は添付のグラフをご確認ください。`;//メール本文の内容はここで変更


  // メールを送信
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: body,
    attachments:[{
      fileName:'graph.png',
      content:data,
      mimeType:'image/png'
    }]
  });

}


//(★トリガー設定が必要)作成したスプレッドシートを自動削除
function deleteSheet(){
  //スクリプトプロパティから対象となるシートを探す(なければ終了)
  const targetId = PropertiesService.getScriptProperties().getProperty('NEWSHEET_ID');

  //スクリプトプロパティが存在していた場合に処理を実行なければ何もせず終了
  if(targetId){
    //スプレッドシートを削除
    DriveApp.getFileById(targetId).setTrashed(true);
    //スクリプトプロパティも削除
    PropertiesService.getScriptProperties().deleteProperty('NEWSHEET_ID');
  }else{
    Logger.log('対象となるシートはありません');
  }
  
}