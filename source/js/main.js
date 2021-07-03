import moduleTest from './modules/module-test';
import jquery from 'jquery/dist/jquery.min';

moduleTest();

window.addEventListener('load',function () {

  let hearts = document.querySelectorAll('.heart-icon');
  let btnOrange = document.querySelectorAll('.btn-orange');

  for(let i = 0; i < hearts.length; i++){
    hearts[i].addEventListener('click',setHeartColor);
  }

  function setHeartColor(){
    if(this.classList.contains('heart-active')){
      this.style.color = 'inherit';
      this.classList.remove('heart-active')
    } else {
      this.style.color = this.dataset.color;
      this.classList.add('heart-active')
    }

  }

  for(let i = 0; i < hearts.length; i++){
    btnOrange[i].addEventListener('click',setBtnColorText);
  }

  function setBtnColorText(){
    if(this.classList.contains('btn-orange')){
      this.classList.remove('btn-orange')
      this.classList.add('btn-blue')
      var span = this.querySelector('span');
      span.innerHTML = 'В корзине'

      $(".btn-orange").dialog();

    } else {
      this.classList.remove('btn-blue')
      this.classList.add('btn-orange')
      var span = this.querySelector('span');
      span.innerHTML = 'В корзину'
    }
    // window.open('https://javascript.info');
  }


});


