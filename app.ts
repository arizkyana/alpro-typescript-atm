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
  atmCard?: AtmCard;
}

interface AtmCard {
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
  atmCard: {
    atmNumber: "ATM001",
    pin: "123456",
  },
};

const accountB: Account = {
  id: "2",
  name: "Rizky",
  accountNumber: "A002",
  email: "rizky@mail.com",
  phone: "0812355555",
  balance: 1500,
  atmCard: {
    atmNumber: "ATM002",
    pin: "555555",
  },
};

const accountDatabase: Account[] = [accountA, accountB];

// login
async function login(): Promise<boolean | Account> {
  console.log("Welcome to ABC Bank");
  console.log("Please insert your ATM Card");

  const valAtmNumber: string = await userInput<string>(
    "Input your atm number: "
  );
  const valPin: string = await userInput<string>("Input your pin: ");

  // find account with that valAtmNumber
  const findAccountByAtmNumber = accountDatabase.find((item: Account) => {
    return (
      item.atmCard?.pin === valPin &&
      item?.atmCard.atmNumber === valAtmNumber &&
      !item?.isBlocked
    );
  });

  if (!findAccountByAtmNumber) {
    return false;
  }

  return findAccountByAtmNumber;
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
  const accountIndex = accountDatabase.findIndex(
    (item) => item.id === account.id
  );
  accountDatabase[accountIndex] = updatedAccount;

  console.log(`Withdraw ${valAmount} success!\n`);

  checkBalance(updatedAccount);
}

// transfer
function transfer(account: Account) {}

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
  console.log("6. exit");
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
      exit();
      break;
    default:
      console.log("menu not found");
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

async function main() {
  //   showMenu();
  const isAuthenticated = await login();
  if (isAuthenticated) {
    const account = isAuthenticated as Account;
    showMenu(account);
  } else {
    exit();
  }
}

// start the application
main();
