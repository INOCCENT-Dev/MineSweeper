window.onload = function(){

  // Model part

  // gamme setting value
  let gameSetting = {
    width:0,
    height:0,
    mine:0
  };

  let cellValue; // cell value
  let openCellValue; // open cell value
  let leftMine; // left mine number
  let firstClick = true; // is first click
  let start = 0; // game start time
  let now = 0; // now time
  let isGameRun = false; // is game running

  // Control part

  document.getElementById("button").onclick = inputSetting; // input button event set
  document.getElementById("retry").onclick = gameRetry; // retry button event set

  // input game setting value
  function inputSetting(){
    // input game setting
    let inputWidth = document.getElementById("inputWidth");
    let inputHeight = document.getElementById("inputHeight");
    let inputMine = document.getElementById("inputMine");

    gameSetting.width = inputWidth.value;
    gameSetting.height = inputHeight.value;
    gameSetting.mine = inputMine.value;

    firstClick = true;
    main(); // start game main function
  }

  // cell value reser
  function resetCellValue(setting){
    let tmpValue = [];
    for(let y = 0; y < setting.height; y ++){
      tmpValue[y] = [];
      for(let x = 0; x < setting.width; x ++){
        tmpValue[y][x] = '0';
      }
    }
    cellValue = tmpValue;
    resetOpenCellValue(setting); // reset open cell value
  }

  // open cell value reset
  function resetOpenCellValue(setting){

    openCellValue = [];

    for(let y = 0; y < setting.height; y ++){

      openCellValue[y] = [];

      for(let x = 0; x < setting.width; x ++){
        openCellValue[y][x] = '0';
      }
    }
  }

  // determine if this is first try
  function isFirstTry(cellXY,first){
    if(first == true){ // if first try create mine
      firstClick = false;
      isGameRun = true;
      timer();
      placeMine(gameSetting,(cellXY.y*gameSetting.width)+cellXY.x);
    }
  }

  // create random number
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

  // place mine function
  function placeMine(setting,except){
    
    let randomNum = random(setting.width * setting.height,setting.mine,except); // output random number

    for(let i = 0; i < setting.mine; i ++){
      cellValue[parseInt(randomNum[i]/setting.width)][randomNum[i]%setting.width] = 'M';
    }
    setNumber(setting);
  }

  // set number inside cell
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
                cellValue[tmpY][tmpX] = cellValue[tmpY][tmpX] + ''; // input mine in cell value
              }
            }  
          }
        }
      }
    } 
  }

  // open cell function
  function openCell(cellXY){
    if(openCellValue[cellXY.y][cellXY.x] != 'F'){
      switch(cellValue[cellXY.y][cellXY.x]) {
        case '0':
          openCellValue[cellXY.y][cellXY.x] = 'N';

          for(let i = 0; i < 9; i ++){ // if cell is empty
            let tmpXY = {
              x: cellXY.x - 1 + (i%3),
              y: cellXY.y - 1 + parseInt(i/3)
            }
            if(tmpXY.x > -1 && tmpXY.y > -1 && tmpXY.x < gameSetting.width && tmpXY.y < gameSetting.height && openCellValue[tmpXY.y][tmpXY.x] != 'N'){
              openCell(tmpXY); // open near cell         
            }
          }
          break;
        case 'M':
          openCellValue[cellXY.y][cellXY.x] = cellValue[cellXY.y][cellXY.x];
          let isPlayerWin = false;
          isGameRun = false; // game stop
          openAllMine(gameSetting); // show all mine
          showGameEnd(isPlayerWin); // game over
          break;
        default :
          openCellValue[cellXY.y][cellXY.x] = cellValue[cellXY.y][cellXY.x];
          break;
      }
    }
    fillCell(gameSetting); // input html cell value
    playerWin(gameSetting); // value game win
  }

  // place flag function                                                        
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
    showLeftMine(leftMine); // input html left mine
    fillCell(gameSetting); // input html cell value
    playerWin(gameSetting); // value game win
  }

  // evaluate game win function
  function playerWin(setting){
    let left = 0;
    for(let y = 0; y < setting.height; y ++){
      for(let x = 0; x < setting.width; x ++){
        if(openCellValue[y][x] == '0'){
          left++;
        }else if(openCellValue[y][x] == 'M'){
          return 0;
        }
      }
    }
    if(left == leftMine){
      let isPlayerWin = true;
      isGameRun = false;
      showGameEnd(isPlayerWin); // show game endding
    } 
  }

  // cell double click function
  function cellDBLClick(cellXY){
    let tmpValue = Number(openCellValue[cellXY.y][cellXY.x]);
    let flagNum = 0;

    if(tmpValue != NaN && tmpValue != 0){ // if cell value is number
      for(let i = 0; i < 9; i ++){
        let tmpXY = {
          x: cellXY.x - 1 + (i%3),
          y: cellXY.y - 1 + parseInt(i/3)
        }

        if(tmpXY.x > -1 && tmpXY.y > -1 && tmpXY.x < gameSetting.width && tmpXY.y < gameSetting.height){
          if(openCellValue[tmpXY.y][tmpXY.x] == 'F'){ // count near flag
            flagNum++
          }      
        }
      }

      if(flagNum == openCellValue[cellXY.y][cellXY.x]){ // if flag number = cell number
        for(let i = 0; i < 9; i ++){
          let tmpXY = {
            x: cellXY.x - 1 + (i%3),
            y: cellXY.y - 1 + parseInt(i/3)
          }
  
          if(tmpXY.x > -1 && tmpXY.y > -1 && tmpXY.x < gameSetting.width && tmpXY.y < gameSetting.height){
            openCell(tmpXY); // open near cell     
          }
        }
      }
    }
  }

  // show all mine
  function openAllMine(setting){
    for(let y = 0; y < setting.height; y ++){
      for(let x = 0; x < setting.width; x ++){
        if(cellValue[y][x] == 'M' && openCellValue[y][x] != 'F') openCellValue[y][x] = 'M';
      }
    }
    fillCell(gameSetting);
  }

  // game main function
  function main(){
    leftMine = gameSetting.mine; // reset left mine count
    isGameRun = false; // reset game running
    start = 0; // reset game start time
    render(gameSetting); // render game screen
    resetCellValue(gameSetting); // reset cell value
  }

  // timer function
  function timer(){
    start = new Date();
    now = start;
    showTime(now); 

    let timer = setInterval(function(){
      if(isGameRun){
        now = new Date();
        showTime(now); // input html time
      }else{
        clearInterval(timer); // if game is not running stop timer
      }
    }, 1000);
  }

  // View part

  // render game screen function
  function render(setting){

    let container = document.getElementById("container"); // get cell container
    container.innerHTML = ''; // cell container reset

    showLeftMine(leftMine);
    showTime(0);
    // set cell container value
    let containerWidth = 'repeat('+setting.width + ', 40px' + ')';
    let containerHeight = 'repeat('+setting.height + ', 40px' + ')';

    container.style.setProperty('grid-template-columns',containerWidth);
    container.style.setProperty('grid-template-row',containerHeight);

    container.oncontextmenu = function() {return false;}

    for(let y = 0; y < setting.height; y ++){
      for(let x = 0; x <setting.width; x ++){
        let cell = document.createElement("button"); // set cell details
        cell.className = 'cell';
        cell.id = 'cell'+y+'.'+x;
        cell.disabled = false;

        container.appendChild(cell); // put cell into html

        let activeCell = {
          x:x,
          y:y
        } 

        cell.addEventListener('click',function(){
          isFirstTry(activeCell,firstClick);
          openCell(activeCell);
        }); // cell left click event

        cell.addEventListener('contextmenu',function(){
          placeFlag(activeCell);
        }); // cell right click event

        cell.addEventListener('dblclick',function(){
          cellDBLClick(activeCell);
        }); // cell double click event
      }
    }
  }

  // fill cell value function
  function fillCell(setting){

    for(let y = 0; y < setting.height; y ++){
      for(let x= 0; x < setting.width; x ++){
        let cell = document.getElementById('cell'+y+'.'+x);

        switch(openCellValue[y][x]) { // value open cell value
          case 'M': // if mine
            cell.innerHTML = '<img class="mine" src="img/mine.png">';
            cell.style.setProperty('background-color','rgb(255,72,72)');
            break;
          case 'N': // if emty
            cell.style.setProperty('background-color','rgb(150, 150, 150)');
            break;
          case 'F': // if flag
            cell.innerHTML = '<img class="flag" src="img/flag.png">';
            cell.style.setProperty('background-color','rgb(150, 150, 150)');
            break;
          case '0': //if unopened
            cell.innerHTML = '';
            cell.style.setProperty('background-color','rgb(239, 239, 239)');
            break;
          case '1': // if cell number
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

  // show left mine function
  function showLeftMine(count){
    document.getElementById("left").innerHTML = '<div class = "flag-container" id = "flag-container"> </div><p>:' + count + '</p>';
    document.getElementById("flag-container").innerHTML = '<img class="flag" src="img/flag.png">';
  }

  // show game over function
  function showGameEnd(isPlayerWin){
    let gameOver = document.getElementById("gameOver");
    let gameEnd = document.getElementById("gameEnd");

    gameOver.style.setProperty('opacity','1'); // reveal game over screen
    gameOver.style.setProperty('z-index','1');
    gameOver.style.setProperty('pointer-events','auto');

    disableCell(gameSetting);

    if(isPlayerWin){
      gameEnd.innerHTML = '<div class = "end-timer-container" id = "end-timer-container"> </div><p>' + parseInt((now - start) / 1000) + "</p><p> You Win </p>";
      document.getElementById("end-timer-container").innerHTML = '<img class="end-timer" src="img/timer.png">';
    }else{
      gameEnd.innerHTML = "You Lose";
    }
  }

  // game reset function
  function gameRetry(){ // reset game html
    let gameOver = document.getElementById("gameOver");

    gameOver.style.setProperty('opacity','0');
    gameOver.style.setProperty('z-index','0');
    gameOver.style.setProperty('pointer-events','none');

    document.getElementById('container').innerHTML = '';
    document.getElementById("left").innerHTML = '';
    document.getElementById("time").innerHTML = '';
  }

  // show game play time function
  function showTime(now){
    document.getElementById("time").innerHTML = '<div class = "timer-container" id = "timer-container"> </div><p>:' + parseInt((now - start) / 1000) + '</p>';
    document.getElementById("timer-container").innerHTML = '<img class="timer" src="img/timer.png">';
  }

  // cell disable
  function disableCell(setting){
    for(let y = 0; y < setting.height; y ++){
      for(let x = 0; x <setting.width; x ++){
        let cell = document.getElementById('cell'+y+'.'+x);
        cell.disabled = true;
      }
    }
  }
}