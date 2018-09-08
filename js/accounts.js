const fs = require('fs');

const fetchAccounts = () => {
    try {
        return JSON.parse(fs.readFileSync('resources/bank-accounts.json'));
    } catch (error) {
        return [];
    }
}
const saveAccounts = (ModifiedAccounts) => {
    fs.writeFileSync('resources/bank-accounts.json', JSON.stringify(ModifiedAccounts, undefined, 3));
}

const bankAccounts = fetchAccounts();

const get = (name) => {
    const account = bankAccounts.filter( ba => ba.name === name );
    if(account.length > 0) {
        console.log(account);
    } else {
        console.log('No matched account');
    }
}

const create = (name, issuedNation, amount) => {
    const checkExist = bankAccounts.filter( ba => ba.name === name );
    if(checkExist.length <= 0) {
        const newAccount = {
            name,
            balance: {
                issuedNation,
                amount
            }
        }
        bankAccounts.push(newAccount);
        saveAccounts(bankAccounts);
    } else {
        console.log('The account is existed');
    }
}
const update = (name, issuedNation, amount) => {
    let account = bankAccounts.filter( ba => ba.name === name);
    if(account.length > 0) {
        const updatedBalance = {
            issuedNation,
            amount
        }
        account[0].balance = updatedBalance;
        saveAccounts(bankAccounts);
    } 
}
const del = (name) => {
    const deletedAccounts = bankAccounts.filter( ba => ba.name != name);
    if(deletedAccounts.length != bankAccounts.length) {
        saveAccounts(deletedAccounts);
    } else {
        console.log('No matched account');
    }
}
const save = (name, amount) => {
    const account = bankAccounts.filter( ba => ba.name === name );
    if(account.length > 0) {
        account[0].balance.amount += amount;
        saveAccounts(bankAccounts);
    } else {
        console.log('No matched account');
    }
}
const withdraw = (name, amount) => {
    const account = bankAccounts.filter( ba => ba.name === name);
    if(account.length > 0) {
        if(account[0].balance.amount < amount) {
            console.log(`Not enough balance! The balance is ${account[0].balance.amount}.`)
        } else {
            account[0].balance.amount -= amount;
            saveAccounts(bankAccounts);
        }
    } else {
        console.log('No matched account');
    }
}

module.exports = {
    get, 
    create,
    update,
    del,
    save,
    withdraw
};