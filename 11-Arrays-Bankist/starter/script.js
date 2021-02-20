'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: 'Shaunak Thakar',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 6.5,
  pin: 1234,
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
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

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}₹</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayAccountBalance = function (acct) {
  acct.balance = acct.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acct.balance}₹`;
};

const displayAccountSummary = function (acct) {
  const income = acct.movements
    .filter(mov => mov > 0)
    .reduce((acc, inc) => acc + inc);
  labelSumIn.textContent = `${income}₹`;

  const out = acct.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => Math.abs(acc) + Math.abs(mov));
  labelSumOut.textContent = `${out}₹`;

  const interest = acct.movements
    .filter(mov => mov > 0)
    .map(dep => (dep * acct.interestRate) / 100)
    .reduce((acc, intr) => acc + intr);
  labelSumInterest.textContent = `${interest}₹`;
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
  displayMovements(acct.movements);
  displayAccountBalance(acct);
  displayAccountSummary(acct);
};

let currentAcct;
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

    updateUI(currentAcct);
  }
});

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
