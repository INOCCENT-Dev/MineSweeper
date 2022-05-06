window.onload = function(){

  // Model part

  // 게임 세팅값
  let gameSetting = {
    width:0,
    height:0,
    mine:0
  };

  let cellValue; // 셀 값
  let openCellValue; // 보여지는 셀 값
  let leftMine; // 남은 지뢰의 수
  let firstClick = true; // 시도 횟수
  let start = 0; // 게임 시작 시간
  let now = 0; // 현재 시간
  let isGameRun = false; // 게임이 끝났는지

  // Control part

  document.getElementById("button").onclick = inputSetting; // input 버튼 이벤트 감지기 설정
  document.getElementById("retry").onclick = gameRetry; // retry 버튼 이벤트 감지기 설정

  // 게임 세팅값 입력
  function inputSetting(){
    
    let inputWidth = document.getElementById("inputWidth");
    let inputHeight = document.getElementById("inputHeight");
    let inputMine = document.getElementById("inputMine");

    gameSetting.width = inputWidth.value;
    gameSetting.height = inputHeight.value;
    gameSetting.mine = inputMine.value;

    firstClick = true;
    main();
  }

  // 셀 값 초기화
  function resetCellValue(setting){
    let tmpValue = [];
    for(let y = 0; y < setting.height; y ++){
      tmpValue[y] = [];
      for(let x = 0; x < setting.width; x ++){
        tmpValue[y][x] = '0';
      }
    }
    cellValue = tmpValue;
    resetOpenCellValue(setting);
  }

  // 보여지는 셀 값 초기화
  function resetOpenCellValue(setting){

    openCellValue = [];

    for(let y = 0; y < setting.height; y ++){

      openCellValue[y] = [];

      for(let x = 0; x < setting.width; x ++){
        openCellValue[y][x] = '0';
      }
    }
  }

  // 처음 누른 것인지 판별
  function isFirstTry(cellXY,first){
    if(first == true){ // 지뢰 생성
      firstClick = false;
      isGameRun = true;
      timer();
      placeMine(gameSetting,(cellXY.y*gameSetting.width)+cellXY.x);
    }
  }

  // 랜덤 값 생성
  function random(max,amount,except) {
    const num = [];
    let i = 0;
    
    while(i<amount){
      let temp = Math.floor(Math.random()*max);
      if(num.indexOf(temp) === -1 && temp != except){
        num[i] = temp;
        i++;
      }
    }
    return num;
  }

  // 지뢰 X Y 좌표 설정
  function placeMine(setting,except){
    // 지뢰 위치 초기화
    let randomNum = random(setting.width * setting.height,setting.mine,except);

    for(let i = 0; i < setting.mine; i ++){
      cellValue[parseInt(randomNum[i]/setting.width)][randomNum[i]%setting.width] = 'M';
    }
    setNumber(setting);
  }

  // 셀 속 숫자 설정
  function setNumber(setting){
    for(let y = 0; y < setting.height; y ++){

      for(let x = 0; x < setting.width; x ++){

        if(cellValue[y][x] == 'M'){

          for(let i = 0; i < 9; i ++){

            let tmpX = x - 1 + (i%3);
            let tmpY = y - 1 + parseInt(i/3);
            if(tmpX > -1 && tmpY > -1 && tmpX < setting.width && tmpY < setting.height){
              if(cellValue[tmpY][tmpX] != 'M') {
                cellValue[tmpY][tmpX] ++ ;
                cellValue[tmpY][tmpX] = cellValue[tmpY][tmpX] + '';
              }
            }  
          }
        }
      }
    } 
  }

  // 셀 열기
  function openCell(cellXY){
    if(openCellValue[cellXY.y][cellXY.x] != 'F'){
      switch(cellValue[cellXY.y][cellXY.x]) {
        case '0':
          openCellValue[cellXY.y][cellXY.x] = 'N';

          for(let i = 0; i < 9; i ++){
            let tmpXY = {
              x: cellXY.x - 1 + (i%3),
              y: cellXY.y - 1 + parseInt(i/3)
            }
            if(tmpXY.x > -1 && tmpXY.y > -1 && tmpXY.x < gameSetting.width && tmpXY.y < gameSetting.height && openCellValue[tmpXY.y][tmpXY.x] != 'N'){
              openCell(tmpXY);         
            }
          }
          break;
        case 'M':
          openCellValue[cellXY.y][cellXY.x] = cellValue[cellXY.y][cellXY.x];
          let isPlayerWin = false;
          isGameRun = false;
          showGameEnd(isPlayerWin);
          break;
        default :
          openCellValue[cellXY.y][cellXY.x] = cellValue[cellXY.y][cellXY.x];
          break;
      }
    }
    fillCell(gameSetting);
    playerWin(gameSetting);
  }

  // 깃발 배치하기                                                              
  function placeFlag(cellXY){
    if(openCellValue[cellXY.y][cellXY.x] != cellValue[cellXY.y][cellXY.x] || openCellValue[cellXY.y][cellXY.x] == '0'){

      if(openCellValue[cellXY.y][cellXY.x] == 'F'){
        openCellValue[cellXY.y][cellXY.x] = '0';
        leftMine ++; 
      }else{
        openCellValue[cellXY.y][cellXY.x] = 'F'
        leftMine --; 
      }
    }
    showLeftMine(leftMine);
    fillCell(gameSetting);
    playerWin(gameSetting);
  }

  // 게임 승리 함수
  function playerWin(setting){
    let left = 0;
    for(let y = 0; y < setting.height; y ++){
      for(let x = 0; x < setting.width; x ++){
        if(openCellValue[y][x] == '0') left++;
      }
    }
    if(left == leftMine){
      let isPlayerWin = true;
      isGameRun = false;
      showGameEnd(isPlayerWin);
    } 
  }

  // 더블 클릭 함수
  function cellDBLClick(cellXY){
    let tmpValue = Number(openCellValue[cellXY.y][cellXY.x]);
    let flagNum = 0;

    if(tmpValue != NaN && tmpValue != 0){
      for(let i = 0; i < 9; i ++){
        let tmpXY = {
          x: cellXY.x - 1 + (i%3),
          y: cellXY.y - 1 + parseInt(i/3)
        }

        if(tmpXY.x > -1 && tmpXY.y > -1 && tmpXY.x < gameSetting.width && tmpXY.y < gameSetting.height){
          if(openCellValue[tmpXY.y][tmpXY.x] == 'F'){
            flagNum++
          }      
        }
      }

      if(flagNum == openCellValue[cellXY.y][cellXY.x]){
        for(let i = 0; i < 9; i ++){
          let tmpXY = {
            x: cellXY.x - 1 + (i%3),
            y: cellXY.y - 1 + parseInt(i/3)
          }
  
          if(tmpXY.x > -1 && tmpXY.y > -1 && tmpXY.x < gameSetting.width && tmpXY.y < gameSetting.height){
            openCell(tmpXY);      
          }
        }
      }
    }
  }

  // 메인 함수
  function main(){
    leftMine = gameSetting.mine;
    isGameRun = false;
    start = 0;
    render(gameSetting);
    resetCellValue(gameSetting);
  }

  // 타이머 함수
  function timer(){
    start = new Date();
    now = start;
    showTime(now); 

    let timer = setInterval(function(){
      if(isGameRun){
        now = new Date();
        showTime(now);
      }else{
        clearInterval(timer);
      }
    }, 1000);
  }

  // View part

  // 게임 화면 랜더링 하기
  function render(setting){

    let container = document.getElementById("container");
    container.innerHTML = ''; // container 초기화

    showLeftMine(leftMine);
    showTime(0);
    
    let containerWidth = 'repeat('+setting.width + ', 40px' + ')';
    let containerHeight = 'repeat('+setting.height + ', 40px' + ')';

    container.style.setProperty('grid-template-columns',containerWidth);
    container.style.setProperty('grid-template-row',containerHeight);

    container.oncontextmenu = function() {return false;}

    for(let y = 0; y < setting.height; y ++){
      for(let x = 0; x <setting.width; x ++){
        let cell = document.createElement("button"); // 셀 설정
        cell.className = 'cell';
        cell.id = 'cell'+y+'.'+x;

        container.appendChild(cell); // 셀 html에 추가

        let activeCell = {
          x:x,
          y:y
        } 

        cell.addEventListener('click',function(){
          isFirstTry(activeCell,firstClick);
          openCell(activeCell);
        }); // 셀 좌클릭 이벤트 감지기

        cell.addEventListener('contextmenu',function(){
          placeFlag(activeCell);
        }); // 셀 우클릭 이벤트 감지기

        cell.addEventListener('dblclick',function(){
          cellDBLClick(activeCell);
        });
      }
    }
  }

  // 셀 값 넣기
  function fillCell(setting){

    for(let y = 0; y < setting.height; y ++){
      for(let x= 0; x < setting.width; x ++){
        let cell = document.getElementById('cell'+y+'.'+x);

        switch(openCellValue[y][x]) {
          case 'M':
            cell.innerHTML = '<img class="mine" src="img/mine.png">';
            cell.style.setProperty('background-color','rgb(255,72,72)');
            break;
          case 'N':
            cell.style.setProperty('background-color','rgb(150, 150, 150)');
            break;
          case 'F':
            cell.innerHTML = '<img class="flag" src="img/flag.png">';
            cell.style.setProperty('background-color','rgb(150, 150, 150)');
            break;
          case '0':
            cell.innerHTML = '';
            cell.style.setProperty('background-color','rgb(239, 239, 239)');
            break;
          case '1':
            cell.style.setProperty('background-color','rgb(32, 121, 208)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '2':
            cell.style.setProperty('background-color','rgb(47, 139, 55)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '3':
            cell.style.setProperty('background-color','rgb(211, 50, 49)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '4':
            cell.style.setProperty('background-color','rgb(138, 57, 161)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '5':
            cell.style.setProperty('background-color','rgb(255, 143, 0)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '6':
            cell.style.setProperty('background-color','rgb(28, 155, 165)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '7':
            cell.style.setProperty('background-color','rgb(30, 30, 30)');
            cell.innerHTML = cellValue[y][x];
            break;
          case '8':
            cell.style.setProperty('background-color','rgb(220, 220, 220)');
            cell.innerHTML = cellValue[y][x];
            break;
        }
      }
    }
  }

  // 남은 지뢰 수 출력
  function showLeftMine(count){
    document.getElementById("left").innerHTML = '<div class = "flag-container" id = "flag-container"> </div><p>:' + count + '</p>';
    document.getElementById("flag-container").innerHTML = '<img class="flag" src="img/flag.png">';
  }

  // 게임 오버 출력 함수
  function showGameEnd(isPlayerWin){
    let gameOver = document.getElementById("gameOver");
    let gameEnd = document.getElementById("gameEnd");

    gameOver.style.setProperty('opacity','1');
    gameOver.style.setProperty('z-index','1');
    gameOver.style.setProperty('pointer-events','auto');

    if(isPlayerWin){
      gameEnd.innerHTML = '<div class = "end-timer-container" id = "end-timer-container"> </div><p>' + parseInt((now - start) / 1000) + "</p><p> You Win </p>";
      document.getElementById("end-timer-container").innerHTML = '<img class="end-timer" src="img/timer.png">';
    }else{
      gameEnd.innerHTML = "You Lose";
    }
  }

  // 게임 재시작 출력 함수
  function gameRetry(){
    let gameOver = document.getElementById("gameOver");

    gameOver.style.setProperty('opacity','0');
    gameOver.style.setProperty('z-index','0');
    gameOver.style.setProperty('pointer-events','none');

    document.getElementById('container').innerHTML = '';
    document.getElementById("left").innerHTML = '';
    document.getElementById("time").innerHTML = '';
  }

  // 게임 시간 출력
  function showTime(now){
    document.getElementById("time").innerHTML = '<div class = "timer-container" id = "timer-container"> </div><p>:' + parseInt((now - start) / 1000) + '</p>';
    document.getElementById("timer-container").innerHTML = '<img class="timer" src="img/timer.png">';
  }
}