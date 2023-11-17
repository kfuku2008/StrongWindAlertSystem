function getFutureWindData() {
  // スクリプトプロパティに取得したAPIキーを呼び出す
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPEN_WEATHER_API_KEY');

  // 現在のUNIX時間を取得
  const currentTime = Math.floor(Date.now() / 1000);

  // 24時間後のUNIX時間を計算
  const twentyFourHoursLater = currentTime + 86400; // 86400秒は24時間

  // 調べたい地域の緯度(latitude)・経度(longitude)を指定（デフォルトで横浜の座標)⇒GoogleMapを開き、地域を入力し、URL内@緯度,経度を取得する
  const latitude = 35.4437;
  const longitude = 139.6380;

  // One Call APIの取得
  const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${twentyFourHoursLater}&appid=${apiKey}`;
  const oneCallResponse = UrlFetchApp.fetch(oneCallUrl);
  const oneCallData = JSON.parse(oneCallResponse.getContentText());

  //24時間後の風速を取得
  const windData = oneCallData['data'][0]['wind_speed'];

  //風速データを確認
  Logger.log(windData)

    // 条件をチェックしてメールを送信するかどうか判断
  if (windData >= 7.0) {
    sendEmail(data);
  } else {
    Logger.log('データが7.0未満のため、メールは送信されませんでした。');
  }
}


function sendEmail(data) {
  // Gmailでメールを送信する処理を追加
  //スクリプトプロパティに自分のメールアドレスを保存
  const recipient = PropertiesService.getScriptProperties().getProperty('MY_MAILADDRESS'); // 送信先のメールアドレスを指定
  const subject = '重要なデータのお知らせ';
  const body = '取得したデータが' + windData + 'です。';

  // メールを送信
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: body,
  });

  Logger.log('メールが送信されました。');
}