'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-12-22T23:36:17.929Z',
    '2020-12-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (acct, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acct.movements.slice().sort((a, b) => a - b)
    : acct.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const movDate = new Date(acct.movementsDates[i]);

    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${getFormattedDate(
      movDate,
      acct.locale,
      true
    )}</div>
      <div class="movements__value">${mov.toFixed(2)}₹</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayAccountBalance = function (acct) {
  acct.balance = acct.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acct.balance.toFixed(2)}₹`;
};

const displayAccountSummary = function (acct) {
  const income = acct.movements
    .filter(mov => mov > 0)
    .reduce((acc, inc) => acc + inc);
  labelSumIn.textContent = `${income.toFixed(2)}₹`;

  const out = acct.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => Math.abs(acc) + Math.abs(mov));
  labelSumOut.textContent = `${out.toFixed(2)}₹`;

  const interest = acct.movements
    .filter(mov => mov > 0)
    .map(dep => (dep * acct.interestRate) / 100)
    .reduce((acc, intr) => acc + intr);
  labelSumInterest.textContent = `${interest.toFixed(2)}₹`;

  labelDate.textContent = `${getFormattedDate(
    new Date(),
    acct.locale
  )} ${getCurrentTime()}`;
};

const getFormattedDate = function (date, locale, isCondensed = false) {
  const calcDaysPassed = (date1, date2) =>
    Math.floor(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  if (isCondensed) {
    const daysPassed = calcDaysPassed(date, new Date());
    if (daysPassed === 0) return 'Today';
    else if (daysPassed === 1) return 'Yesterday';
    else if (daysPassed <= 7) return `${daysPassed} days ago`;
  }

  return Intl.DateTimeFormat(locale).format(date);
};

const getCurrentTime = function () {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, 0);
  const mins = `${now.getMinutes()}`.padStart(2, 0);
  return `${hour}:${mins}`;
};

const generateUserNames = function (accts) {
  accts.forEach(function (acct) {
    acct.userName = acct.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
generateUserNames(accounts);

const updateUI = function (acct) {
  displayMovements(acct);
  displayAccountBalance(acct);
  displayAccountSummary(acct);
};

let currentAcct, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAcct = accounts.find(acc => acc.userName === inputLoginUsername.value);

  if (currentAcct?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAcct.owner.split(' ')[0]
    }`;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    containerApp.style.opacity = 100;

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    updateUI(currentAcct);
  }
});

const startLogOutTimer = function () {
  let time = 120;
  const tick = function () {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };

  const logOutTimer = setInterval(tick, 1000);
  return logOutTimer;
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const receiverAcct = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  const amount = Number(inputTransferAmount.value);

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcct &&
    currentAcct.balance >= amount &&
    currentAcct.userName !== receiverAcct.userName
  ) {
    currentAcct.movements.push(-amount);
    receiverAcct.movements.push(amount);
    currentAcct.movementsDates.push(new Date().toISOString());
    receiverAcct.movementsDates.push(new Date().toISOString());

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    updateUI(currentAcct);
    inputTransferAmount.blur();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAcct.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    currentAcct.movements.push(loanAmount);
    currentAcct.movementsDates.push(new Date().toISOString());

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    updateUI(currentAcct);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAcct.userName &&
    Number(inputClosePin.value) === currentAcct.pin
  ) {
    const deleteIndex = accounts.findIndex(
      acct => acct.userName === inputCloseUsername.value
    );
    accounts.splice(deleteIndex, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currentAcct.movements, sorted);
});
