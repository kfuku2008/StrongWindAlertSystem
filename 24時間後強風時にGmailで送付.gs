function getFutureWindData() {
  // スクリプトプロパティに取得したAPIキーを呼び出す
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPEN_WEATHER_API_KEY');

  // 現在のUNIX時間を取得
  const currentTime = Math.floor(Date.now() / 1000);

  // 1~24時間後のUNIXリストを作成
  const unixList = [];

  //1時間ごとの風速データ格納用
  const futureHourlywindList = [];

  for (let i=0; i<=86400; i+=3600){
    const futureTime = currentTime+i
    unixList.push(futureTime)
  }

  // 調べたい地域の緯度(latitude)・経度(longitude)を指定（デフォルトで横浜の座標)⇒GoogleMapを開き、地域を入力し、URL内@緯度,経度を取得する
  const latitude = 35.4437;
  const longitude = 139.6380;

  
  for (let v=0;v < unixList.length;v++){
  // One Call APIの取得
  const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${unixList[v]}&appid=${apiKey}`;
  const oneCallResponse = UrlFetchApp.fetch(oneCallUrl);
  const oneCallData = JSON.parse(oneCallResponse.getContentText());

  //24時間後の風速を取得
  const windData = oneCallData['data'][0]['wind_speed'];

  //風速データを確認(現在～24時間後(1時間おき)で1タイミングでも7.0m/sを超えていたらメールを送付)
  futureHourlywindList.push(windData);
  }

  //出力確認用
  Logger.log(futureHourlywindList);

  for (let j=0;j<futureHourlywindList.length;j++){
    // 条件をチェックしてメールを送信するかどうか判断
    if (futureHourlywindList[j] >= 7.0) {
      sendEmail();
      break;
    } else {
      Logger.log('データが7.0未満のため、メールは送信されませんでした。');
    }
  }
}


function sendEmail(data) {
  // Gmailでメールを送信する処理を追加
  //スクリプトプロパティに自分のメールアドレスを保存
  const recipient = PropertiesService.getScriptProperties().getProperty('MY_MAILADDRESS'); // 送信先のメールアドレスを指定
  const subject = '重要なデータのお知らせ';
  const body = '24時間以内に強風が発生する可能性があります。\nご注意ください!';//次の修正で詳細なデータをメールで送付できるように修正

  // メールを送信
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: body,
  });

  Logger.log('メールが送信されました。');
}