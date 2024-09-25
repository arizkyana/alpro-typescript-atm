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

interface Bill {
  label: string;
  amount: number;
  periode: string[];
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

const billDatabase: Bill[] = [
  {
    label: "Electricity",
    amount: 200,
    periode: ["25/08/2024", "25/09/2024"],
  },
  {
    label: "Internet and Phone",
    amount: 150,
    periode: ["25/08/2024", "25/09/2024"],
  },
  {
    label: "Credit Card",
    amount: 50,
    periode: ["25/08/2024", "25/09/2024"],
  },
];

let cardAccountDatabase: AtmCard[] = [cardAccountA, cardAccountB];

// login
async function login(): Promise<boolean | { account: Account; card: AtmCard }> {
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

  return {
    account: findAccountByAtmNumber?.account,
    card: findAccountByAtmNumber,
  };
}

// cek saldo (checkBalance)
function checkBalance(account: Account, card: AtmCard) {
  console.log("Your current balance is: ", account.balance);
  showMenu(account, card);
}

// ambil uang (withdraw)
async function withdraw(account: Account, card: AtmCard) {
  const valAmount: number = await userInput("input amount withdrawal: ");

  if (!isBalanceMoreThanExpectedAmount(account, valAmount)) {
    console.log("insufficent balance, please try again...");
    return withdraw(account, card);
  }

  const updatedAccount = { ...account };

  updatedAccount.balance = updatedAccount.balance - valAmount;

  // find index of this account in database
  const cardIndex = cardAccountDatabase.findIndex(
    (item) => item.account.id === account.id
  );
  cardAccountDatabase[cardIndex].account = updatedAccount;

  console.log(`Withdraw ${valAmount} success!\n`);

  checkBalance(updatedAccount, card);
}

// transfer
async function transfer(account: Account, card: AtmCard) {
  const valAccountDestination: string = await userInput(
    "input destination account number: "
  );

  const cardIndex = cardAccountDatabase.findIndex((item) => {
    return item.account.accountNumber === valAccountDestination;
  });

  if (cardIndex < 0) {
    console.log("account not found, please try again...");
    return transfer(account, card);
  }

  const accountByCard = cardAccountDatabase[cardIndex];

  const valTransferAmount: string = await userInput("transfer amount: ");

  if (!isBalanceMoreThanExpectedAmount(account, Number(valTransferAmount))) {
    console.log(
      "insufficent balance, you cannot transfer that amount right now."
    );
    return showMenu(account, card);
  }

  console.log();

  confirm(
    `Are you sure want to transfer ${valTransferAmount} to ${accountByCard?.account?.accountNumber} - ${accountByCard?.account.name}`,
    function onCancel() {
      console.log("Your last transaction is cancelled");
      showMenu(account, card);
    },
    function onConfirm() {
      const updatedAccount = { ...account };
      const destinationAccount = { ...accountByCard.account };

      updatedAccount.balance =
        updatedAccount.balance - Number(valTransferAmount);
      destinationAccount.balance =
        destinationAccount.balance + Number(valTransferAmount);

      console.log("Successfully transfer");

      // update cardAccountDatabase
      cardAccountDatabase[cardIndex].account = { ...destinationAccount };

      showMenu(updatedAccount, card);
    }
  );
}

// bayar (payment)
async function payment(account: Account, card: AtmCard) {
  // show payment list
  console.log("\n ---- Bills ---- \n");
  console.log("1. Electicity");
  console.log("2. Internet and Phone");
  console.log("3. Credit Card");
  console.log("\n ------- \n");

  // bills
  const valSelectedBill: string = await userInput(
    "Choose a service bill (1-3): "
  );

  const billIndex = Number(valSelectedBill) - 1;
  const selectedBill: Bill = { ...billDatabase[billIndex] };

  confirm(
    `Are you sure want to pay: ${selectedBill.label}, amount: ${selectedBill.amount} (Y/n): `,
    function onCancel() {
      console.log("Your last transaction is canceled");
      showMenu(account, card);
    },
    function onConfirm() {
      if (!isBalanceMoreThanExpectedAmount(account, selectedBill.amount)) {
        console.log("Your last transaction is canceled");
        return showMenu(account, card);
      }
      const updatedAccount = {
        ...account,
        balance: account.balance - selectedBill.amount,
      } as Account;
      console.log("Payment success!");
      showMenu(updatedAccount, card);
    }
  );
}

// ubah pin (changePin)
async function changePin(account: Account, card: AtmCard) {
  const valCurrentPin = await userInput("Input current PIN: ");
  if (card.pin !== valCurrentPin) {
    console.log("PIN is wrong. Your last transaction is cancelled");
    return showMenu(account, card);
  }

  const valNewPin = await userInput("Input new PIN: ");
  if (!`${valNewPin}`.match(/d/)) {
    console.log("PIN must be numeric only. Your last transaction is cancelled");
    return showMenu(account, card);
  }

  // update card database
  const cardIndex = cardAccountDatabase.findIndex(
    (item) => item.id === card.id
  );
  const selectedCard = { ...card, pin: valNewPin } as AtmCard;
  cardAccountDatabase[cardIndex] = selectedCard;

  console.log("Succesfully update new PIN");
  showMenu(account, card);
}

// exit
function exit() {
  rl.close();
}

async function showMenu(account: Account, card: AtmCard) {
  console.log("\n-----------------");
  console.log("1. check balance");
  console.log("2. withdraw");
  console.log("3. transfer");
  console.log("4. bill");
  console.log("5. change pin");
  console.log("6. exit");
  console.log("-----------------\n");

  const selectedMenu: string = await userInput("Choose menu: ");

  switch (selectedMenu) {
    case "1":
      checkBalance(account, card);
      break;
    case "2":
      withdraw(account, card);
      break;
    case "3":
      transfer(account, card);
      break;
    case "4":
      payment(account, card);
      break;
    case "5":
      changePin(account, card);
      break;
    case "6":
      exit();
      break;
    default:
      showMenu(account, card);
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

function isBalanceMoreThanExpectedAmount(
  account: Account,
  expectedAmount: number
) {
  return account.balance > expectedAmount;
}

async function confirm(
  message: string,
  onCancel: () => void,
  onConfirm: () => void
) {
  const valConfirm: string = await userInput(message);
  if (valConfirm.toLowerCase() !== "y") {
    return onCancel();
  }
  onConfirm();
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
    const { account, card } = isAuthenticated as {
      account: Account;
      card: AtmCard;
    };
    showMenu(account, card);
  } else {
    loginAttempt += 1;
    console.log(`your card number and pin is invalid. ${loginAttempt}`);
    main();
  }
}

// start the application
main();
