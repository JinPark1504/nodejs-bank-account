const fs = require('fs');
const yargs = require('yargs');
const axios = require('axios');

let fetchAccounts = () => {
    try {
        return JSON.parse(fs.readFileSync('resources/bank-accounts.json'));
    } catch (error) {
        console.log('Bank Account is not found!');
        return [];
    }
}

const argv = yargs
    .command('exchange', 'Exchange with calculation of the price in the fiat currency of the buyer', {
        buyer: {
            describe: "Buyer's name",
            demand: true,
            alias: 'b'
        },
        seller: {
            describe: "Seller's name",
            demand: true,
            alias: 's'
        },
        price: {
            describe: 'price based on seller',
            demand: true,
            alias: 'p'
        }
    })
    .command('get', "Show up the owner's account info", {
        name: {
            describe: "Owner's name of the account",
            demand: true,
            alias: 'n'
        }
    })
    .command('new', 'Create an account', {
        name: {
            describe: "Owner's name of the account",
            demand: true,
            alias: 'n'
        },
        issuedNation: {
            describe: `Name of country for standard currency`,
            demand: true,
            alias: 'i'
        }, 
        amount: {
            describe: 'balance of the account',
            demand: true,
            alias: 'a'
        }
    })
    .command('update', 'Update the account', {
        name: {
            describe: "Owner's name of the account",
            demand: true,
            alias: 'n'
        },
        issuedNation: {
            describe: `Name of country for standard currency`,
            demand: true,
            alias: 'i'
        }, 
        amount: {
            describe: 'balance of the account',
            demand: true,
            alias: 'a'
        }
    })
    .command('delete', 'Delete the account', {
        name: {
            describe: "Owner's name of the account",
            demand: true,
            alias: 'n'
        },
    })
    .command('save', 'Save money', {
        name: {
            describe: "Owner's name of the account",
            demand: true,
            alias: 'n'
        },
        amount: {
            describe: 'saving amount',
            demand: true,
            alias: 'a'
        }
    })
    .command('withdraw', 'Withdrwa money', {
        name: {
            describe: "Owner's name of the account",
            demand: true,
            alias: 'n'
        },
        amount: {
            describe: 'withdrawal amount',
            demand: true,
            alias: 'a'
        }
    })
    .help()
    .argv;

const exchange = require('./js/exchange.js');
const accounts = require('./js/accounts.js')

const checkNation = (nations, issuedNation) => {
    // console.log(issuedNation);
    if(nations.includes(issuedNation)) {
        return true;
    } else {
        return false;
    }
}

argv._.forEach( async a => {
    if(a === 'exchange') {
        //chapitalize the first letter
        const buyer = argv.b.charAt(0).toUpperCase() + argv.b.substring(1).toLowerCase();
        const seller = argv.s.charAt(0).toUpperCase() + argv.s.substring(1).toLowerCase();
        const price = argv.p;
        exchange(buyer, seller, price);
    }
    
    if(argv.n) {
        
        const name = argv.n.charAt(0).toUpperCase() + argv.n.substring(1).toLowerCase();
        // console.log(argv);
        const amount = argv.a;
        //check issuedNation's input is existed in nations.    
        const response = await axios.get('https://restcountries.eu/rest/v2/all');
        const nations = response.data.map( r => r.name );
        const issuedNation = argv.i;
        
        if(issuedNation != undefined) {
            if(checkNation(nations, issuedNation)) {
                switch (a) {
                    case 'new':
                        accounts.create(name, issuedNation, amount);
                        break;
                    case 'update':
                        accounts.update(name, issuedNation, amount);
                        break;
                }
            } else {
                return console.log(`${issuedNation} is not included in ${nations}`);
            }
            
        } else {
            console.log('not entered nations');
        }
        switch (a) {
            case 'new':
                if(checkNation(nations, issuedNation)) {
                    accounts.create(name, issuedNation, amount);
                } else {
                    return console.log(`${issuedNation} is not included in ${nations}`);
                }
                break;
            case 'update':
                accounts.update(name, issuedNation, amount);
                break;
            case 'delete':
                accounts.del(name);
                break;
            case 'save':
                accounts.save(name, amount);
                break;
            case 'withdraw':
                accounts.withdraw(name, amount);
                break;
            case 'get':
                accounts.get(name);
                break;
        }

    }
})