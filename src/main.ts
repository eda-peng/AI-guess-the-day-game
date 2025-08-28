export { };
//import { Button, Input } from "@pixi/ui";
//import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { Select, CheckBox } from '@pixi/ui';
import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
declare global {
  interface GlobalThis {
    __PIXI_APP__: typeof Application;
  }
}

(async () => {
  // Create a new application
  const app = new PIXI.Application();

  // Initialize the application
  await app.init({
    // width: 800,
    // height: 350,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xEAA7AC,
    // resolution: window.devicePixelRatio || 1,
    resolution: Math.max(window.devicePixelRatio || 1, 2), // 避免模糊
    autoDensity: true, // 讓解析度適配 retina
  });
  // 因打包異常註解
  // globalThis.__PIXI_APP__ = app; 
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const container = document.getElementById("pixi-container");
  if (container) {
    container.appendChild(app.canvas);
  } else {
    console.error("找不到 #pixi-container");
  }

  // 新增一個主 UI 容器，所有 UI 元件都將放入其中
  const uiContainer = new PIXI.Container();
  app.stage.addChild(uiContainer);

  

  const numberToWeekMap: Record<number, string> = {
    0: "星期日",
    1: "星期一",
    2: "星期二",
    3: "星期三",
    4: "星期四",
    5: "星期五",
    6: "星期六",
  };
  
  let targetDate = new Date
  let targetDateWeek = 0;
  let curScore = 0; 
  let timeLeft = 10;
  let timerInterval: number;
  let timeScoreRatio = 2;
  let dateScoreRatio = 5;
  let selectedGameTime = 60; // 新增：儲存選擇的時間
  const timeValues = [30, 60, 120]; // 新增：對應選項的值
  const dateRangeValues = [ // 新增：日期範圍選項的值
    "1900-2100-5",
    "2000-2040-3",
    "2020-2030-2",
    "2025-2025-1"
  ];
  let selectedDateRangeValue = dateRangeValues[3]; // 新增：儲存選擇的日期範圍
  let isAnswerVisible = false; // 新增：儲存「顯示答案」的狀態

  //物件函式
  function createLabeledBox(message: string, style: PIXI.TextStyle, padding: number = 10): {
    container: PIXI.Container;
    text: PIXI.Text;
    bg: PIXI.Graphics;
  } {
    const text = new PIXI.Text(message, style);
    text.x = padding;
    text.y = padding;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.7);
    bg.drawRoundedRect(0, 0, text.width + padding * 2, text.height + padding * 2, 10);
    bg.endFill();

    const container = new PIXI.Container();
    container.addChild(bg);
    container.addChild(text);

    return { container, text, bg }; // 回傳以便後續修改
  }

  function createAnswerButton(label: string, x: number, y: number, onClick: () => void): PIXI.Container {
    const buttonWidth = 60;
    const buttonHeight = 60;
    const buttonContainer = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x336699); // Blue
    bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 15);
    bg.endFill();
    buttonContainer.addChild(bg);

    const text = new PIXI.Text(label, {
        fontFamily: "Arial",
        fontSize: 24,
        fill: "white",
        align: "center"
    });
    text.anchor.set(0.5);
    text.x = buttonWidth / 2;
    text.y = buttonHeight / 2;
    buttonContainer.addChild(text);

    buttonContainer.eventMode = "static";
    buttonContainer.cursor = "pointer";

    buttonContainer.on("pointerdown", onClick);
    buttonContainer.on("pointerover", () => { bg.tint = 0x5c85ad; }); // Lighter blue
    buttonContainer.on("pointerout", () => { bg.tint = 0xFFFFFF; }); // Back to normal

    buttonContainer.x = x;
    buttonContainer.y = y;

    return buttonContainer;
}

  function createButton(label: string, x: number, y: number, onClick: () => void): PIXI.Container {
    const buttonContainer = new PIXI.Container();

    // 背景矩形
    const bg = new PIXI.Graphics();
    bg.beginFill(0x4CAF50); // 綠色
    bg.drawRoundedRect(0, 0, 120, 40, 10);
    bg.endFill();
    buttonContainer.addChild(bg);

    // 按鈕文字
    const text = new PIXI.Text(label, {
      fontFamily: "Arial",
      fontSize: 18,
      fill: "white",
      align: "center"
    });
    text.anchor.set(0.5);
    text.x = 60;
    text.y = 20;
    buttonContainer.addChild(text);

    // 啟用互動
    buttonContainer.eventMode = "static";
    buttonContainer.cursor = "pointer";
    buttonContainer.on("pointerdown", onClick);

    // 設定位置
    buttonContainer.x = x;
    buttonContainer.y = y;

    //滑過變色
    buttonContainer.on("pointerover", () => {
      bg.tint = 0x66bb6a; // 淺綠
    });
    buttonContainer.on("pointerout", () => {
      bg.tint = 0xFFFFFF; // 原色
    });

    return buttonContainer;
  }
  function updateBackground(bg: PIXI.Graphics, text: PIXI.Text, padding: number = 10) {
    bg.clear();
    bg.beginFill(0x000000, 0.7);
    bg.drawRoundedRect(0, 0, text.width + padding * 2, text.height + padding * 2, 10);
    bg.endFill();
  }



  // **文字**
  // 全域樣式定義
  const textStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fill: "white",
    wordWrap: true,
    wordWrapWidth: 300
  });

  const questionTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 48, // 放大字體
    fill: "white",
  });

  // 建立題目文字
  const { container: questionBox, text: questionText, bg: questionBg } = createLabeledBox("XXXX/XX/XX", questionTextStyle);
  questionBox.x = 300;
  questionBox.y = 150;
  uiContainer.addChild(questionBox);
  questionText.text = "XXXXXXX/"
  updateBackground(questionBg, questionText);
  // 建立得分顯示文字
  const { container: scoreBox, text: scoreText, bg: scoreBg } = createLabeledBox("得分：0", textStyle);
  scoreBox.x = 30;
  scoreBox.y = 20;
  uiContainer.addChild(scoreBox);
  // 建立最高得分顯示文字
  const { container: highScoreBox, text: highScoreText, bg: highScoreBg } = createLabeledBox("最高分：0", textStyle);
  highScoreBox.x = 30;
  highScoreBox.y = 70;
  uiContainer.addChild(highScoreBox);
  // 建立解答文字 (使用與題目相同的樣式)
  const { container: answerBox, text: answerText, bg: answerBg } = createLabeledBox(`${numberToWeekMap[targetDateWeek]}`, questionTextStyle);
  answerBox.x = 450;
  answerBox.y = 150;
  uiContainer.addChild(answerBox);
  // 建立時間文字
  const { container: timerBox, text: timerText, bg: timerBg } = createLabeledBox("剩餘時間：60", textStyle);
  timerBox.x = 610;
  timerBox.y = 20;
  uiContainer.addChild(timerBox);
  
  // **按鈕**
  const nextButton = createButton("下一題", 650, 280, () => {
    newQuestion();
  });
  uiContainer.addChild(nextButton);
  const resetGameButten = createButton("重新開始", 30, 280, () => {
    newGame();
  });
  uiContainer.addChild(resetGameButten);
  // const showAnswerButten = createButton("顯示答案", 650, 150, () => {
  //   if (answerText.visible == false) {
  //     answerText.visible = true;
  //   } else {
  //     answerText.visible = false;
  //   }
  //   showAnswer();
  // });
  // app.stage.addChild(showAnswerButten);
  const clearHighScoreButton = createButton("清除紀錄", 30, 230, () => {
    localStorage.removeItem('highScore');
    updateHighScoreDisplay();
  });
  uiContainer.addChild(clearHighScoreButton);

  // **新增遊戲教學按鈕**
  const tutorialButton = createButton("遊戲教學", 30, 180, () => {
      openTutorial();
  });
  uiContainer.addChild(tutorialButton);

  // **PixiUI 時間選擇**
  const timeSelectLabel = new PIXI.Text('選擇時間：', { ...textStyle, fontSize: 16, fill: 'black' });
  uiContainer.addChild(timeSelectLabel);

  const selectTextStyle = {
    fontFamily: "Arial",
    fontSize: 18,
    fill: "white",
  };

  const selectClosedBG = new PIXI.Graphics()
    .beginFill(0x4CAF50) // 使用與按鈕相同的綠色
    .drawRoundedRect(0, 0, 120, 40, 10)
    .endFill();

  // 開啟時的背景，需要足夠容納所有選項
  const selectOpenBG = new PIXI.Graphics()
    .beginFill(0x333333)
    .drawRoundedRect(0, 0, 120, 170, 10)
    .endFill();

  const timeSelectPixi = new Select({
    closedBG: selectClosedBG,
    openBG: selectOpenBG,
    textStyle: selectTextStyle,
    items: {
        items: ['30秒', '60秒', '120秒'],
        backgroundColor: 0x66bb6a,
        hoverColor: 0x81c784,
        width: 120,
        height: 40,
        textStyle: { ...selectTextStyle, fill: 'white' },
        radius: 10,
    },
    selected: 1, // 預設選擇 '60秒'
    visibleItems: 3,
    scrollBox: {
        width: 120, // 與 closedBG 寬度相同
        height: 40 * 3, // item height * visibleItems
        radius: 10,
    }
  });
  timeSelectPixi.onSelect.connect((value) => {
      selectedGameTime = timeValues[value];
      newGame(); // 使用新的時間設定重新開始遊戲
  });
  //uiContainer.addChild(timeSelectPixi);

  // **PixiUI 日期範圍選擇 (Select 版本)**
  const dateRangeLabels = [
    "1900-2100",
    "2000-2040",
    "2020–2030",
    "2025"
  ];
  const dateRangeSelectLabel = new PIXI.Text('日期範圍：', { ...textStyle, fontSize: 16, fill: 'black' });
  uiContainer.addChild(dateRangeSelectLabel);

  const dateRangeSelectClosedBG = new PIXI.Graphics()
      .beginFill(0x4CAF50) 
      .drawRoundedRect(0, 0, 120, 40, 10)
      .endFill();

  const dateRangeSelectOpenBG = new PIXI.Graphics()
      .beginFill(0x333333)
      .drawRoundedRect(0, 0, 120, 210, 10) // 容納 4 個選項
      .endFill();

  const dateRangeSelectPixi = new Select({
      closedBG: dateRangeSelectClosedBG,
      openBG: dateRangeSelectOpenBG,
      textStyle: selectTextStyle,
      items: {
          items: dateRangeLabels,
          backgroundColor: 0x4CAF50,
          hoverColor: 0x66bb6a, // 修正為與主題一致的淺綠色
          width: 120,
          height: 40,
          textStyle: { ...selectTextStyle, fill: 'white' },
          radius: 10,
      },
      selected: 3, // 預設選擇第四個
      visibleItems: 4,
      scrollBox: {
          width: 120,
          height: 40 * 4,
          radius: 10,
      }
  });
  dateRangeSelectPixi.onSelect.connect((value) => {
      selectedDateRangeValue = dateRangeValues[value];
      newGame();
  });
  dateRangeSelectPixi.on('pointerdown', () =>
  {
      // 將選單移到最上層，避免被其他元件遮擋
      uiContainer.addChild(dateRangeSelectPixi);
  });
  //uiContainer.addChild(dateRangeSelectPixi);

  // **PixiUI 顯示答案 CheckBox**
  const showAnswerUncheckedBox = new PIXI.Graphics()
      .lineStyle(2, 0x333333)
      .drawRoundedRect(0, 0, 18, 18, 4)
      .endFill();

  const showAnswerCheckedBox = new PIXI.Graphics()
      .lineStyle(2, 0x333333)
      .beginFill(0x4CAF50) // 綠色
      .drawRoundedRect(0, 0, 18, 18, 4)
      .endFill();

  const showAnswerCheckboxPixi = new CheckBox({
      text: '顯示答案',
      style: {
          unchecked: showAnswerUncheckedBox,
          checked: showAnswerCheckedBox,
          text: { ...textStyle, fontSize: 16, fill: 'black' },
          textOffset: { x: 4, y: -2 }
      }
  });
  showAnswerCheckboxPixi.onCheck.connect((checked) => {
      isAnswerVisible = checked;
      answerText.visible = isAnswerVisible;
  });
  uiContainer.addChild(showAnswerCheckboxPixi);
  //為避免遮擋由下往上新增
  uiContainer.addChild(dateRangeSelectPixi);
  uiContainer.addChild(timeSelectPixi);

  // **遊戲教學畫面**
  const tutorialContainer = new PIXI.Container();
  tutorialContainer.visible = false;
  uiContainer.addChild(tutorialContainer);

  const tutorialBg = new PIXI.Graphics();
  tutorialBg.beginFill(0x000000, 0.8);
  tutorialBg.drawRect(0, 0, 850, 450); // 使用設計尺寸以覆蓋整個 UI 容器
  tutorialBg.endFill();
  tutorialContainer.addChild(tutorialBg);
 
  // 新增一個標題
  const tutorialTitle = new PIXI.Text("遊戲教學", {
      fontFamily: "Arial",
      fontSize: 28,
      fill: "white",
      align: 'center'
  });
  tutorialTitle.anchor.set(0.5);
  tutorialTitle.x = 850 / 2;
  tutorialTitle.y = 35; // 標題 Y 位置
  tutorialContainer.addChild(tutorialTitle);

  // 1. 定義滾動區域的尺寸和位置
  const scrollAreaPadding = { top: 70, right: 50, bottom: 90, left: 50 };
  const scrollAreaWidth = 850 - scrollAreaPadding.left - scrollAreaPadding.right;
  const scrollAreaHeight = 450 - scrollAreaPadding.top - scrollAreaPadding.bottom;

  // 2. 建立一個容器來放置可滾動的文字
  const scrollableTextContainer = new PIXI.Container();
  scrollableTextContainer.x = scrollAreaPadding.left;
  scrollableTextContainer.y = scrollAreaPadding.top;
  tutorialContainer.addChild(scrollableTextContainer);

  // 3. 建立文字物件
  const tutorialTextStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "white",
      wordWrap: true,
      wordWrapWidth: scrollAreaWidth - 20, // 讓文字和邊緣有點間距
      align: 'left',
      lineHeight: 30,
  });

  const tutorialTextContent = `
  1.  計算基準日星期：2025年基準日為星期五，通過計算得到該年基準日星期。
      如2030年為 5(2025年為星期五) + 5(2030-2025) + 1(2028年為閏年) 
      = 11 
      = 4 (mod 7)  
      因此2030年基準日為星期四。
  2.  找到該月基準日：
      (1).  2以外的偶數月份的基準日為月份相同日期。
            如4/4、6/6、8/8、...、12/12。
      (2).  大奇數以7-11來記。
            3/7、5/9、7/11、9/5、11/7。
      (3).  1、2月要注意閏年，閏年會晚一天。
            1/10、2/28(閏年為1/11、2/29)。
      如8/28為8月，找到基準日為8/8。
  3.  計算基準日差距。
      如2025/8/28為8月，找到基準日為8/8。
      5(2025年的基準日星期) + 28(目標28號) - 8(基準日8號)
      = 25
      = 4 (mod 7)
      因此2025/8/28是星期四。
  `;

  const tutorialText = new PIXI.Text(tutorialTextContent, tutorialTextStyle);
  tutorialText.x = 10; // 在 scrollableTextContainer 內的 x 偏移
  tutorialText.y = 0;
  scrollableTextContainer.addChild(tutorialText);

  // 4. 建立遮罩 (Mask)
  const scrollMask = new PIXI.Graphics();
  scrollMask.beginFill(0xFFFFFF); // 遮罩的顏色和透明度不重要
  scrollMask.drawRect(scrollableTextContainer.x, scrollableTextContainer.y, scrollAreaWidth, scrollAreaHeight);
  scrollMask.endFill();
  tutorialContainer.addChild(scrollMask); // 遮罩本身也需要被加到場景中
  scrollableTextContainer.mask = scrollMask;

  // 5. 讓滾動區域可以互動，以接收滾輪事件
  scrollableTextContainer.eventMode = 'static';
  scrollableTextContainer.on('wheel', (event) => {
      // 只有當文字內容高度大於可視區域高度時，才允許滾動
      if (tutorialText.height > scrollAreaHeight) {
          const newY = tutorialText.y - event.deltaY * 0.5; // 乘以一個係數可以調整滾動速度
          const minY = scrollAreaHeight - tutorialText.height; // 滾動的下邊界
          const maxY = 0; // 滾動的上邊界
          tutorialText.y = Math.max(minY, Math.min(newY, maxY)); // 確保 y 座標在邊界內
      }
  });

  const tutorialCloseButton = createButton("關閉", 0, 0, () => {
      closeTutorial();
  });
  // 將關閉按鈕置中於教學畫面底部
  tutorialCloseButton.x = 850 / 2 - tutorialCloseButton.width / 2;
  tutorialCloseButton.y = 450 - 60; // 調整按鈕位置
  tutorialContainer.addChild(tutorialCloseButton);

  // **新增猜題按鈕**
  const answerButtonsContainer = new PIXI.Container();
  uiContainer.addChild(answerButtonsContainer);

  const shortWeekDayMap = ["一", "二", "三", "四", "五", "六", "日"];
  const weekDayValues =   [1, 2, 3, 4, 5, 6, 0]; // 對應 getDay() 的值
  const answerButtonWidth = 60;
  const answerButtonSpacing = 10;

  for (let i = 0; i < 7; i++) {
      const dayLabel = shortWeekDayMap[i];
      const dayValue = weekDayValues[i];
      const button = createAnswerButton(dayLabel, i * (answerButtonWidth + answerButtonSpacing), 0, () => {
          checkAnswer(dayValue);
      });
      answerButtonsContainer.addChild(button);
  }


  // **各種函式**
  function openTutorial() {
    clearInterval(timerInterval);
    tutorialContainer.visible = true;
    // 確保教學畫面在最上層
    uiContainer.setChildIndex(tutorialContainer, uiContainer.children.length - 1);
    tutorialText.y = 0; // 每次打開時，都將文字滾動回頂部
  }

  function closeTutorial() {
    startCountdown(timeLeft); // 用剩餘時間繼續倒數
    tutorialContainer.visible = false;
  }

  // 時間
  function startCountdown(seconds: number) {
    timeLeft = seconds;
    timerText.text = `剩餘時間：${timeLeft}`;
    // 清除前一個倒數（如果有）
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft --;
      timerText.text = `剩餘時間：${timeLeft}`;
      updateBackground(timerBg, timerText);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        onTimeUp(); // 執行時間到的動作
      }
    }, 1000);
  }
  // 比對猜測
  function checkAnswer(guessedWeek: number){
    if (guessedWeek == targetDateWeek) {
      addScore();
      newQuestion();
    }else{
      reduceScore();
    }
  }
  // 加分
  function addScore() {
    if(isAnswerVisible == true) return;
    curScore += 1 * timeScoreRatio * dateScoreRatio;
    console.log(timeScoreRatio + ":" + dateScoreRatio);
    scoreText.text = `得分：${curScore}`;
    updateBackground(scoreBg, scoreText);
  }
  // 扣分
  function reduceScore() {
    if (isAnswerVisible == true) return;
    curScore -= 1 * timeScoreRatio * dateScoreRatio;
    console.log(timeScoreRatio + ":" + dateScoreRatio);
    scoreText.text = `得分：${curScore}`;
    updateBackground(scoreBg, scoreText);
  }
  // 分數歸零
  function resetScore() {
    curScore = 0;
    scoreText.text = `得分：${curScore}`;
    updateBackground(scoreBg, scoreText);
  }
  // 更新最高得分
  function updateHighScoreDisplay() {
    const highScore = parseInt(localStorage.getItem('highScore') || "0");
    highScoreText.text = `最高分：${highScore}`;
    updateBackground(highScoreBg, highScoreText);
  }
  // 顯示答案
  function showAnswer(){
    answerText.text = `${numberToWeekMap[targetDateWeek]}`;
    updateBackground(answerBg, answerText);
  }
  // 隨機日期
  function getRandomDate() {
    const [startYear, endYear, scoreRatio] = selectedDateRangeValue.split('-').map(Number);
    dateScoreRatio = scoreRatio;

    const startDate = new Date(startYear, 0, 1);
    const endDate = new Date(endYear, 11, 31);
    return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  }
  // 新題目開始
  function newQuestion(){
    targetDate = getRandomDate();
    targetDateWeek = targetDate.getDay();
    questionText.text = targetDate.toLocaleDateString();
    updateBackground(questionBg, questionText); // 更新背景以符合文字大小
    answerText.visible = isAnswerVisible;
    showAnswer();
  }
  // 一局遊戲結束
  function onTimeUp(){
    let highScore = parseInt(localStorage.getItem('highScore') || "0");
    if (curScore > highScore) {
      localStorage.setItem('highScore', curScore.toString());
      alert(`時間到！新紀錄！得分：${curScore}`);
      updateHighScoreDisplay();
    } else {
      alert(`時間到！得分：${curScore}，最高紀錄：${highScore}`);
    }
  }
  // 新遊戲開始
  function newGame() {
    resetScore();
    newQuestion();
    // 讀取使用者選擇的時間
    const selectedSeconds = selectedGameTime;
    if (selectedSeconds == 30){
      timeScoreRatio = 4;
    } else if (selectedSeconds == 60){
      timeScoreRatio = 2;
    }else{
      timeScoreRatio = 1;
    }
    startCountdown(selectedSeconds);
  }
  
  updateHighScoreDisplay();
  newQuestion();
  // 初次啟動倒數
  startCountdown(selectedGameTime);
  layoutUI();
  layoutDOMElements();

  // 手機板畫面縮放修改
  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    layoutUI();
    layoutDOMElements();
  });

  function layoutUI() {
    const designWidth = 850;
    const designHeight = 450;
    const padding = 20;

    // 1. 根據固定的設計尺寸來定位所有 UI 元件
    // 將題目和答案群組置中
    const questionAnswerPadding = 30;
    const combinedWidth = questionBox.width + answerBox.width + questionAnswerPadding;
    const startX = (designWidth / 2) - (combinedWidth / 2);
    questionBox.x = startX;
    questionBox.y = designHeight * 0.45;
    answerBox.x = questionBox.x + questionBox.width + questionAnswerPadding;
    answerBox.y = questionBox.y;

    const totalAnswerButtonWidth = (answerButtonWidth * 7) + (answerButtonSpacing * 6);
    answerButtonsContainer.x = designWidth / 2 - totalAnswerButtonWidth / 2;
    answerButtonsContainer.y = designHeight * 0.65;

    nextButton.x = designWidth / 2 - nextButton.width / 2;
    nextButton.y = answerButtonsContainer.y + 90;

    // 左側 UI
    timerBox.x = padding;
    timerBox.y = padding;
    scoreBox.x = padding;
    scoreBox.y = timerBox.y + timerBox.height + 10;
    highScoreBox.x = padding;
    highScoreBox.y = scoreBox.y + scoreBox.height + 10;
    resetGameButten.x = padding;
    resetGameButten.y = designHeight - 60;
    clearHighScoreButton.x = padding;
    clearHighScoreButton.y = resetGameButten.y - 50;
    tutorialButton.x = padding;
    tutorialButton.y = clearHighScoreButton.y - 50;

    // 右側 UI
    timeSelectPixi.x = designWidth - timeSelectPixi.width - padding;
    timeSelectPixi.y = padding;
    timeSelectLabel.x = timeSelectPixi.x - timeSelectLabel.width;
    timeSelectLabel.y = timeSelectPixi.y + (timeSelectPixi.height / 2) - (timeSelectLabel.height / 2);
    dateRangeSelectPixi.x = designWidth - dateRangeSelectPixi.width - padding;
    dateRangeSelectPixi.y = timeSelectPixi.y + timeSelectPixi.height + 10;
    dateRangeSelectLabel.x = dateRangeSelectPixi.x - dateRangeSelectLabel.width;
    dateRangeSelectLabel.y = dateRangeSelectPixi.y + (dateRangeSelectPixi.height / 2) - (dateRangeSelectLabel.height / 2);
    showAnswerCheckboxPixi.x = designWidth - showAnswerCheckboxPixi.width - padding;
    showAnswerCheckboxPixi.y = dateRangeSelectPixi.y + dateRangeSelectPixi.height + 15;

    // 2. 根據實際螢幕尺寸，計算縮放比例並置中整個 UI 容器
    const scale = Math.min(app.screen.width / designWidth, app.screen.height / designHeight);
    uiContainer.scale.set(scale);
    uiContainer.x = (app.screen.width - uiContainer.width) / 2;
    uiContainer.y = (app.screen.height - uiContainer.height) / 2;
  }

  function layoutDOMElements() {
    // 此函式現在是空的，因為所有 UI 元素都由 PixiJS 管理。
  }
})();
