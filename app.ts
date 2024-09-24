import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  phone: string;
  email: string;
  balance: number;
  isBlocked?: boolean;
}

interface AtmCard {
  id: string;
  account: Account;
  pin: string;
  atmNumber: string;
}

const accountA: Account = {
  id: "1",
  name: "Agung",
  accountNumber: "A001",
  email: "agung@mail.com",
  phone: "0812341234",
  balance: 1000,
};

const accountB: Account = {
  id: "2",
  name: "Rizky",
  accountNumber: "A002",
  email: "rizky@mail.com",
  phone: "0812355555",
  balance: 1500,
};

const cardAccountA: AtmCard = {
  id: "1",
  account: accountA,
  atmNumber: "ATM001",
  pin: "123456",
};

const cardAccountB: AtmCard = {
  id: "2",
  account: accountB,
  atmNumber: "ATM002",
  pin: "123456",
};

const cardAccountDatabase: AtmCard[] = [cardAccountA, cardAccountB];

// login
async function login(): Promise<boolean | Account> {
  console.log("Welcome to ABC Bank");
  console.log("Please insert your ATM Card");

  const valAtmNumber: string = await userInput<string>(
    "Input your atm number: "
  );
  const valPin: string = await userInput<string>("Input your pin: ");

  // find account with that valAtmNumber
  const findAccountByAtmNumber = cardAccountDatabase.find((item: AtmCard) => {
    return (
      item.pin === valPin &&
      item.atmNumber === valAtmNumber &&
      !item?.account.isBlocked
    );
  });

  if (!findAccountByAtmNumber) {
    return false;
  }

  return findAccountByAtmNumber?.account;
}

// cek saldo (checkBalance)
function checkBalance(account: Account) {
  console.log("Your current balance is: ", account.balance);
  showMenu(account);
}

// ambil uang (withdraw)
async function withdraw(account: Account) {
  const valAmount: number = await userInput("input amount withdrawal: ");

  if (valAmount > account.balance) {
    console.log("insufficent balance, please try again...");
    return withdraw(account);
  }

  const updatedAccount = { ...account };

  updatedAccount.balance = updatedAccount.balance - valAmount;

  // find index of this account in database
  const cardIndex = cardAccountDatabase.findIndex(
    (item) => item.account.id === account.id
  );
  cardAccountDatabase[cardIndex].account = updatedAccount;

  console.log(`Withdraw ${valAmount} success!\n`);

  checkBalance(updatedAccount);
}

// transfer
async function transfer(account: Account) {
  const valAccountDestination: string = await userInput(
    "input destination account number: "
  );

  const cardIndex = cardAccountDatabase.findIndex((item) => {
    return item.account.accountNumber === valAccountDestination;
  });

  if (cardIndex <= 0) {
    console.log("account not found, please try again...");
    transfer(account);
  }

  const valTransferAmount: number = await userInput("transfer amount ");

  const selectedDestinationAccount = {
    ...cardAccountDatabase[cardIndex].account,
    balance: cardAccountDatabase[cardIndex].account.balance + valTransferAmount,
  } as Account;
}

// bayar (payment)
function payment(account: Account) {}

// ubah pin (changePin)
function changePin(account: Account) {}

// exit
function exit() {
  rl.close();
}

async function showMenu(account: Account) {
  console.log("\n-----------------");
  console.log("1. check balance");
  console.log("2. withdraw");
  console.log("3. transfer");
  console.log("4. payment");
  console.log("5. change pin");
  console.log("6. logout");
  console.log("7. exit");
  console.log("-----------------\n");

  const selectedMenu: string = await userInput("Choose menu: ");
  console.log("selected menu: ", selectedMenu);

  switch (selectedMenu) {
    case "1":
      checkBalance(account);
      break;
    case "2":
      withdraw(account);
      break;
    case "3":
      transfer(account);
      break;
    case "4":
      payment(account);
      break;
    case "5":
      changePin(account);
      break;
    case "6":
      login();
    case "7":
      exit();
      break;
    default:
      showMenu(account);
      break;
  }
}

async function userInput<T>(question: string): Promise<T> {
  return new Promise((resolve) => {
    rl.question(question, (value) => {
      resolve(value as T);
    });
  });
}

let loginAttempt: number = 0;

async function main() {
  //   showMenu();

  if (loginAttempt >= 3) {
    console.log(`You have been try 3 times.`);
    exit();
  }

  const isAuthenticated = await login();
  if (isAuthenticated) {
    const account = isAuthenticated as Account;
    showMenu(account);
  } else {
    loginAttempt += 1;
    console.log(`your card number and pin is invalid. ${loginAttempt}`);
    main();
  }
}

// start the application
main();
