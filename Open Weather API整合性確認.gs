//取得した風速情報とOpen Weatherサイト上の風速情報が一致しているかを確認するスクリプト
//実行ボタンを押した時間と現在の風速データがスプレッドシートに書き込まれるようにする

function getFutureWindDataTest() {
  // スクリプトプロパティに取得したAPIキーを呼び出す
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPEN_WEATHER_API_KEY');

  // 現在のUNIX時間を取得
  const currentTime = Math.floor(Date.now() / 1000);


  // 調べたい地域の緯度(latitude)・経度(longitude)を指定（デフォルトで横浜の座標)⇒GoogleMapを開き、地域を入力し、URL内@緯度,経度を取得する
  const latitude = 35.4437;
  const longitude = 139.6380;

  // One Call APIの取得
  const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${currentTime}&appid=${apiKey}`;
  const oneCallResponse = UrlFetchApp.fetch(oneCallUrl);
  const oneCallData = JSON.parse(oneCallResponse.getContentText());

  const windSpeedData = oneCallData['data'][0]['wind_speed']
  //出力確認用
  Logger.log(windSpeedData);
  

  //スプレッドシートに記録
  //スプレッドシートのIDをスクリプトプロパティに記録(スプレッドシートURL内記載)
  
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  const ss = SpreadsheetApp.openById(id);

  //シート名を記載
  const sheetName = "風速記録_Yokohama";
  const sheet = ss.getSheetByName(sheetName);

  //最終行の値を取得
  const lastRow = sheet.getLastRow();

  //実行した時間を取得
  const pushTime = new Date().toLocaleString('ja-JP');

  Logger.log(pushTime);

  //日時と風速データをスプレッドシートへ記載(openweatherのキャプチャも隣に添付)
  const list = [[pushTime,windSpeedData]];
  const range = sheet.getRange(lastRow+1,1,1,2);

  range.setValues(list);


}