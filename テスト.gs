function myFunction() {
  // 現在のUNIX時間を取得
  const currentTime = Math.floor(Date.now() / 1000);

  // 1~24時間後のUNIXリストを作成
  unixList = [];
  for (let i=0; i<=86400; i+=3600){
    const futureTime = currentTime+i
    unixList.push(futureTime*1000)
  }

}
