//現在の天気データを取得
//OPEN_WEATHER_MaP_APIを取得⇒方法：https://hibi-update.org/other/openweathermap-api/
//クレジット登録不要で使える
//取得したAPIをスクリプトプロパティに保存する⇒https://blog.take-it-easy.site/gas/using-script-properties-in-gas/

function getNowWeatherData() {
  // スクリプトプロパティに取得したAPIキーを呼び出す
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPEN_WEATHER_API_KEY');

  //取得したいエリアを指定
  const area = 'Osaka'

  // 天気予報の取得
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${area}&appid=${apiKey}`;
  const weatherResponse = UrlFetchApp.fetch(weatherUrl);
  const weatherData = JSON.parse(weatherResponse.getContentText());


  // 結果の表示
  Logger.log("天気予報データ:");
  Logger.log(weatherData);

  Logger.log("天気")
  Logger.log(weatherData['weather'][0]['main'])

  Logger.log("風速データ:");
  Logger.log(weatherData['wind']['speed']);
}