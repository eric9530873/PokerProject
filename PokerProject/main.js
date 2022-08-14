const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const view = {
  getcardcontent(index){
    const number = this.tranformnumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index/13)]
    return `<p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`
  },

  getcardelement (index){
    return `<div data-index=${index} class="card back"></div>`
  },

  tranformnumber(number){
    switch(number){
      case 1:
        return 'A'
      case 11 :
        return 'J'
      case 12 :
        return 'Q'
      case 13 :
        return 'K'
      default:
        return number
    }
  },
  // displaycard : function displaycard(){

  // }
  // 當物件的屬性與函式/變數名稱相同,可簡寫成
  displaycards(indexex) {
    const rootelement = document.querySelector('#cards')
    rootelement.innerHTML = indexex.map(index=>this.getcardelement(index)).join("")
  },

  flipCards(...cards) {
    cards.map(card=>{
      // 如果是背面回傳正面
    if(card.classList.contains('back')){
      card.classList.remove('back')
      card.innerHTML = this.getcardcontent(Number(card.dataset.index))
      return
    }
    // 如果是正面回傳背面
    card.classList.add('back')
    card.innerHTML = null
    })
  },

  paireds(...cards){
    cards.map(card=>{
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },

  appendwronganimation(...cards){
    cards.map(card =>{
      card.classList.add('wrong')
      card.addEventListener('animationend',event =>
        event.target.classList.remove('wrong'),{once:true
      })
    })
  },

  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// Fisher-Yates Shuffle
const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


// revealedCards 是一個暫存牌組，使用者每次翻牌時，就先把卡片丟進這個牌組，集滿兩張牌時就要檢查配對有沒有成功，檢查完以後，這個暫存牌組就需要清空。
const model = {
  revealedcards:[],
  score: 0,
  triedTimes: 0,

  isrevealedcardmatched (){
    return this.revealedcards[0].dataset.index % 13 === this.revealedcards[1].dataset.index % 13 
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards(){
    view.displaycards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態,做不同的行為
  dispatchcardaction(card){
    if(!card.classList.contains('back')){
      return
    }
    // 遇到return就會停止function,break會停止當前 外面繼續
    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedcards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedcards.push(card)
        if(model.isrevealedcardmatched()){
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.paireds(...model.revealedcards)
          model.revealedcards = []
          if(model.score === 260){
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendwronganimation(...model.revealedcards)
          setTimeout(this.resetcards,1000)
        }
        console.log(model.isrevealedcardmatched())
        break
    }
    console.log(this.currentState)
    console.log(model.revealedcards)
  },
  resetcards(){
    view.flipCards(...model.revealedcards)
      model.revealedcards = []
      controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.generateCards()
// 選取每張卡片 都加上監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event =>{
    console.log(event.target.dataset.index)
    controller.dispatchcardaction(card)
  })
});
