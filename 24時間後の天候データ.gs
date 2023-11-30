//OPEN_WEATHER_MaP_APIを取得⇒方法：https://hibi-update.org/other/openweathermap-api/
//24時間後の天気データを取得については(one call API 3.0が必要（クレジット登録が必要（1 日あたり最初の 1,000 件の API 呼び出しは無料で行うことが可能））
//取得したAPIをスクリプトプロパティに保存する⇒https://blog.take-it-easy.site/gas/using-script-properties-in-gas/

function getWeatherForecast() {
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

  // 結果の表示
  Logger.log("24時間後の天気");
  Logger.log(oneCallData['data'])
  //Logger.log(oneCallData['data'][0]['weather'][0]['main'])

  Logger.log("24時間後の風速データ:");
  Logger.log(oneCallData['data'][0]['wind_speed']);
}


