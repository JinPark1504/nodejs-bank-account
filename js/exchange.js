const fs = require('fs');
const axios = require('axios');

let bankAccounts = [];

try {
    bankAccounts = JSON.parse(fs.readFileSync('resources/bank-accounts.json'));
} catch (error) {
    console.log('Bank Account is not found!');
}

// get balance info by using name
const getAccounts = async (buyer, seller, amount) => {
    const accountOfBuyer = bankAccounts.filter( account => account.name === buyer);
    const accountOfSeller = bankAccounts.filter( account => account.name === seller);
    return [accountOfBuyer, accountOfSeller, amount];
}
// get currency of country
const currencyOfNation = async (from, to) => {
    const response = await axios.get(`https://restcountries.eu/rest/v2/all`);

    const currencyOfBuyer = response.data.filter( nation => nation.name === from || nation.altSpellings.filter( name => name === from).length > 0 )[0].currencies[0].code
    const currencyOfSeller = response.data.filter( nation => nation.name === to || nation.altSpellings.filter( name => name === to).length > 0 )[0].currencies[0].code
    return [currencyOfBuyer, currencyOfSeller];
}

// get rate btn two currencies
// exchange each amount to pay and to receive
const exchangedAmount = async (from, to, amount) => {
    const response = await axios.get(`http://data.fixer.io/api/latest?access_key=9ea52f38bb9703965aac1664d692140f`);
    const rate = response.data.rates[from] / response.data.rates[to];
    return [amount * rate, amount];
}

// save the changed balance after calculation
const updateAccounts = async (accountOfBuyer, accountOfSeller, exchangedAmount, amount) => {
    const balanceOfBuyer = accountOfBuyer.balance.amount - exchangedAmount;
    const balanceOfSeller = accountOfSeller.balance.amount + amount;

    if(balanceOfBuyer < 0) {
        return [];
    } else {
        accountOfBuyer.balance.amount = Math.round(balanceOfBuyer * 100) / 100;
        accountOfSeller.balance.amount = balanceOfSeller;
        return [accountOfBuyer, accountOfSeller];
    }    
}

const exchange = async (buyer, seller, price) => {
    getAccounts(buyer, seller, price).then(account => {
        currencyOfNation(account[0][0].balance.issuedNation, account[1][0].balance.issuedNation).then(currency => {
            console.log(`The price ${account[2]} '${currency[1]}' will be paid from ${account[0][0].name}'s account balance ${account[0][0].balance.amount} '${currency[0]}' to ${account[1][0].name}'s balance ${account[1][0].balance.amount} '${currency[1]}'.`);
            exchangedAmount(currency[0], currency[1], account[2]).then( exchanged => {
                updateAccounts(account[0][0], account[1][0], exchanged[0], exchanged[1]).then( updatedAccount => {
                    if(updatedAccount.length == 0) {
                        console.log(`No enough balance! ${buyer}'s balance is less than ${Math.round(exchanged[0] * 100 ) / 100}.`);
                    } else {
                        bankAccounts.forEach( b => {
                            if(b.name === buyer) {
                                b = updatedAccount[0];
                            } else if(b.name === seller) {
                                b = updatedAccount[1];
                            }
                        });
                        // bankAccounts.forEach( b => console.log(b));
                        fs.writeFileSync('resources/bank-accounts.json', JSON.stringify(bankAccounts, undefined, 3));
                        console.log(`After the transaction, the balance of ${updatedAccount[0].name} is ${updatedAccount[0].balance.amount}, and that of ${updatedAccount[1].name} is ${updatedAccount[1].balance.amount}.`);
                    }
                });
            });
        });
    });
}
module.exports = exchange;