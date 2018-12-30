/**
 * Class of libre money chart generator
 *
 * Create instance context:
 *
 *      var myMoney = {};
 *
 * Create instance of class in context with constructor parameters
 *
 *      libreMoneyClass.call(myMoney, 80);
 *
 * Add a member account:
 *
 *      myMoney.addAccount();
 *
 * Debug c3.js chart data
 *
 *      console.log(myMoney.generateData());
 *
 * More infos:
 *
 * https://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
 *
 */
var libreMoneyClass = function(lifeExpectancy) {

    this.YEAR = 'YEAR';
    this.MONTH = 'MONTH';
   
    this.CO_CREATOR = 'CC';
    this.NON_CREATOR = 'NC';
    this.COMMUNITY = 'COM';
    this.ACCOUNT_TYPES = [this.CO_CREATOR, this.NON_CREATOR, this.COMMUNITY];

    this.INFINITY_FACTOR = 1.234567;
    
    // Default Values
    this.LIFE_EXPECTANCY = 80;
    this.DIVIDEND_START = 1000;
    this.TIME_LOWER_BOUND_IN_YEARS = 0;
    this.TIME_UPPER_BOUND_IN_YEARS = 5;
    this.CALCULATE_GROWTH = true;
    this.PER_YEAR_GROWTH = 20;
    this.PER_MONTH_GROWTH = 2;
    this.MAX_DEMOGRAPHY = 10000;
    this.XMIN_DEMOGRAPHY = 0;
    this.XMAX_DEMOGRAPHY = 80;
    this.XMPV_DEMOGRAPHY = 40;
    this.PLATEAU_DEMOGRAPHY = 78;
    this.XSCALE_DEMOGRAPHY = 4;
    this.DEFAULT_MONEY_BIRTH = 1;
    this.DEFAULT_STARTING_PERCENT = 0;
    this.DEFAULT_TRANSACTION_AMOUNT = 10;

    this.ALL_ACCOUNT = {
        id: -1
    };
    
    this.moneyBirth = -1;
    // {int} Members life expectancy
    this.lifeExpectancy = lifeExpectancy || this.LIFE_EXPECTANCY;
    // {int} First dividend amount (at first year or first month, it depends of 'growthTimeUnit')
    this.dividendStart = this.DIVIDEND_START;
    // {int} Time lower bound for plot generation
    this.timeLowerBoundInYears = this.TIME_LOWER_BOUND_IN_YEARS;
    // {int} Time upper bound for plot generation
    this.timeUpperBoundInYears = this.TIME_UPPER_BOUND_IN_YEARS;

    // {boolean} Indicate if growth has to be calculated from life expectancy
    this.calculateGrowth = this.CALCULATE_GROWTH;
    // {String} Indicate the rythm of the dividend creation (YEAR or MONTH)
    this.growthTimeUnit = this.YEAR;
    // {int} Order of magnitude of the maximum demography
    this.maxDemography = this.MAX_DEMOGRAPHY;
    this.xMinDemography = this.XMIN_DEMOGRAPHY;
    this.xMaxDemography = this.XMAX_DEMOGRAPHY;
    this.xMpvDemography = this.XMPV_DEMOGRAPHY;
    this.plateauDemography = this.PLATEAU_DEMOGRAPHY;
    this.xScaleDemography = this.XSCALE_DEMOGRAPHY;
   
    // {double} Monetary supply growth in percent (per year or per month, it depends of 'growthTimeUnit')
    if (this.growthTimeUnit === this.MONTH) {
        this.growth = this.PER_MONTH_GROWTH;
    }
    else if (this.growthTimeUnit === this.YEAR) {
        this.growth = this.PER_YEAR_GROWTH;
    }
    else {
        throw new Error("Growth time unit not managed");
    }
   
    this.accounts = [];
    this.transactions = [];
    this.referenceFrames = {
        'monetaryUnit': {
            transform: function(money, value, timeStep, amountRef) {
                return value;
            },
            invTransform: function(money, value, timeStep, amountRef) {
                return value;
            },
            logScale: false
        },
        'dividend': {
            transform: function(money, value, timeStep, amountRef) {
                return value / money.dividends.values[timeStep];
            },
            invTransform: function(money, value, timeStep, amountRef) {
                return value * money.dividends.values[timeStep];
            },
            logScale: false
        },
        'average': {
            transform: function(money, value, timeStep, amountRef) {
                if (money.monetarySupplies.values[timeStep] === 0) {
                    return Infinity;
                }
                return value / money.monetarySupplies.values[timeStep] * money.headcounts.values[timeStep] * 100;
            },
            invTransform: function(money, value, timeStep, amountRef) {
                if (money.headcounts.values[timeStep] === 0) {
                    return Infinity;
                }
                return value * money.monetarySupplies.values[timeStep] / money.headcounts.values[timeStep] / 100;
            },
            logScale: false
        },
        'account': {
            transform: function(money, value, timeStep, amountRef) {
                return value / amountRef * 100;
            },
            invTransform: function(money, value, timeStep, amountRef) {
                return value * amountRef / 100;
            },
            logScale: false
        }
    };   
   
    // dididend formulas
    this.udFormulas = {
        'BasicUD': {
            // BasicUD(t+dt) = c*M(t)/N(t+dt)
            calculate: function (money, timeStep) {
                var pTimeStep = money.previousTimeStep(timeStep);
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var previousMonetarySupply = money.getMonetarySupply(pTimeStep);
                    return money.getGrowth() * (previousMonetarySupply / currentHeadcount);
                } else {
                    var previousDividend = money.dividends.values[pTimeStep];
                    return previousDividend;
                }
            }
        },
        'UDA': {
            // UDA(t+dt) = Max[UDA(t) ; c*M(t)/N(t+dt)]
            calculate: function (money, timeStep) {
                var pTimeStep = money.previousTimeStep(timeStep);
                var previousDividend = money.dividends.values[pTimeStep];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var previousMonetarySupply = money.getMonetarySupply(pTimeStep);
                    return Math.max(previousDividend, money.getGrowth() * (previousMonetarySupply / currentHeadcount));
                } else {
                    return previousDividend;
                }
            }
        },
        'UDB': {
            // UDB(t+dt) = (1+c)*UDB(t)
            calculate: function (money, timeStep) {
                var pTimeStep = money.previousTimeStep(timeStep);
                var previousDividend = money.dividends.values[pTimeStep];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    return previousDividend * (1 + money.getGrowth());
                } else {
                    return previousDividend;
                }
            }
        },
        'UDC': {
            // UDC(t+dt) = 1/2*(UDBasique + UDB)
            calculate: function (money, timeStep) {
                var pTimeStep = money.previousTimeStep(timeStep);
                var previousDividend = money.dividends.values[pTimeStep];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var previousMonetarySupply = money.getMonetarySupply(pTimeStep);
                    var udBasic = money.getGrowth() * (previousMonetarySupply / currentHeadcount);
                    var udb = previousDividend * (1 + money.getGrowth());
                    return (udBasic + udb) / 2;
                    //return Math.pow((udBasic * udb), 0.5);
                } else {
                    return previousDividend;
                }
            }
        },
        'UDG': {
            // DU(t+dt) = DU(t) + c² M(t-dt)/N(t)
            calculate: function (money, timeStep) {
                var pTimeStep = money.previousTimeStep(timeStep);
                var ppTimeStep = money.previousTimeStep(pTimeStep);
                var previousDividend = money.dividends.values[pTimeStep];
                var previousHeadcount = money.headcounts.values[pTimeStep]
                var currentHeadcount = money.headcounts.values[timeStep]
                if (previousHeadcount > 0 && currentHeadcount > 0) {
                    var previous2MonetarySupply = money.monetarySupplies.values[ppTimeStep];
                    return previousDividend + (Math.pow(money.getGrowth(), 2) * (previous2MonetarySupply / previousHeadcount));
                }
                else {
                    return previousDividend;
                }
            }
        }
    };
   
    this.previousTimeStep = function(timeStep) {
        return timeStep - 1;
    }
    
    // population variation profiles
    this.demographicProfiles = {
        'None': {
            calculate: function (money, year) {
                return 0;
            }
        },
        'Triangular': {
            calculate: function (money, year) {
                if (year <= money.xMinDemography) {
                    return 0;
                }
                if (year >= money.xMaxDemography) {
                    return 0;
                }
                if (year <= money.xMpvDemography) {
                    return Math.trunc(money.maxDemography * (year - money.xMinDemography) / (money.xMpvDemography - money.xMinDemography));
                }
                if (year >= money.xMpvDemography) {
                    return Math.trunc(money.maxDemography * (money.xMaxDemography - year) / (money.xMaxDemography - money.xMpvDemography));
                }
                return 0;
            }
        },
        'Plateau': {
            calculate: function (money, year) {
                var slopeDuration = ((money.xMaxDemography - money.xMinDemography) - money.plateauDemography) / 2;
                var xMean1 = money.xMinDemography + slopeDuration;
                var xMean2 = money.xMaxDemography - slopeDuration;
                if (year <= money.xMinDemography) {
                    return 0;
                }
                if (year >= money.xMaxDemography) {
                    return 0;
                }
                if (year <= xMean1) {
                    return Math.trunc(money.maxDemography * (year - money.xMinDemography) / (xMean1 - money.xMinDemography));
                }
                if (year >= xMean2) {
                    return Math.trunc(money.maxDemography * (money.xMaxDemography - year) / (money.xMaxDemography - xMean2));
                }
                return money.maxDemography;
            }
        },
        'Cauchy': {
            calculate: function (money, year) {
                var tmp = (year - money.xMpvDemography) / money.xScaleDemography;
                return Math.trunc(money.maxDemography / (1 + tmp * tmp));
            }
        },
        'DampedWave': {
            calculate: function (money, year) {
                var x = year / (2 * money.xScaleDemography);
               
                return Math.trunc(money.maxDemography * (1 - Math.cos(2*x) / (1 + x * x)));
            }
        },
        'Sigmoid': {
            calculate: function (money, year) {
                var s = money.xScaleDemography;
                return Math.trunc(money.maxDemography * (1 / (1 + s * 100 * Math.exp(-0.6 * year / s))));
            }
        }
    };

    this.MONETARY_UNIT_REF_KEY = Object.keys(this.referenceFrames)[0];
    this.DIVIDEND_REF_KEY = Object.keys(this.referenceFrames)[1];
    this.AVERAGE_REF_KEY = Object.keys(this.referenceFrames)[2];
    this.ACCOUNT_REF_KEY = Object.keys(this.referenceFrames)[3];
    this.referenceFrameKey = this.MONETARY_UNIT_REF_KEY;

    this.BASIC_UD_KEY = Object.keys(this.udFormulas)[0];
    this.UDA_KEY = Object.keys(this.udFormulas)[1];
    this.UDB_KEY = Object.keys(this.udFormulas)[2];
    this.UDC_KEY = Object.keys(this.udFormulas)[3];
    this.UDG_KEY = Object.keys(this.udFormulas)[4];
    this.udFormulaKey = this.BASIC_UD_KEY;

    this.NONE_PROFILE_KEY = Object.keys(this.demographicProfiles)[0];
    this.TRIANGULAR_PROFILE_KEY = Object.keys(this.demographicProfiles)[1];
    this.PLATEAU_PROFILE_KEY = Object.keys(this.demographicProfiles)[2];
    this.CAUCHY_PROFILE_KEY = Object.keys(this.demographicProfiles)[3];
    this.DAMPEDWAVE_PROFILE_KEY = Object.keys(this.demographicProfiles)[4];
    this.SIGMOID_PROFILE_KEY = Object.keys(this.demographicProfiles)[5];
    this.demographicProfileKey = this.NONE_PROFILE_KEY;

    this.resetAccounts = function () {
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            this.accounts[iAccount].balance = 0;
            this.accounts[iAccount].values = [];
            this.accounts[iAccount].x = [];
            this.accounts[iAccount].y = [];
        }
    };

    this.resetMoneyBirth = function () {
        var moneyBirth = +Infinity;
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            moneyBirth = Math.min(moneyBirth, this.accounts[iAccount].birth);
        }
        this.moneyBirth = moneyBirth;
    }
   
    this.calcGrowth = function() {
        var growthPerYear = Math.pow(this.lifeExpectancy / 2, 2 / this.lifeExpectancy) - 1;
        if (this.growthTimeUnit === this.YEAR) {
            this.growth = growthPerYear;
        }
        else if (this.growthTimeUnit === this.MONTH) {
            this.growth = Math.pow((1 + growthPerYear), 1/12) - 1;
        }
        else {
            throw new Error("Growth time unit not managed");
        }
    };

    this.getHeadcount = function(timeStep) {
        if (timeStep < this.headcounts.values.length) {
            return this.headcounts.values[timeStep];
        }
        var headcount = 0;

        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            if (this.isAlive(this.accounts[iAccount], timeStep) && !this.isCommunity(this.accounts[iAccount])) {
                headcount++;
            }
        }
        
        return headcount + this.demographicProfiles[this.demographicProfileKey].calculate(this, this.getTimeValue(timeStep, this.YEAR));
    };

    this.asJSonRep = function() {
        var jsonRep = {
            f : this.udFormulaKey,
            r : this.referenceFrameKey,
            rs : {
                mu: {
                    log: this.referenceFrames[this.MONETARY_UNIT_REF_KEY].logScale
                },
                ud: {
                    log: this.referenceFrames[this.DIVIDEND_REF_KEY].logScale
                },
                mn: {
                    log: this.referenceFrames[this.AVERAGE_REF_KEY].logScale
                }
            },
            le : this.lifeExpectancy,
            ud0 : this.dividendStart,
            tm : this.timeLowerBoundInYears,
            tM : this.timeUpperBoundInYears,
            cc : this.calculateGrowth,
            cu : this.growthTimeUnit,
            c : this.growth,
            d : this.demographicProfileKey,
            dyM : this.maxDemography,
            dxm : this.xMinDemography,
            dxM : this.xMaxDemography,
            dxPv : this.xMpvDemography,
            dp : this.plateauDemography,
            dxs : this.xScaleDemography,
            ac : this.accounts.length,
            tc : this.transactions.length
        };
        for (var i = 0; i < this.accounts.length; i++) {
            jsonRep['a' + i] = {
                id: this.accounts[i].id,
                b: this.accounts[i].birth,
                d: this.accounts[i].duration,
                a0: this.accounts[i].startingPercentage,
                t: this.accounts[i].type
            }
        }
        for (var i = 0; i < this.transactions.length; i++) {
            jsonRep['t' + i] = {
                id: this.transactions[i].id,
                f: this.transactions[i].from.id,
                t: this.transactions[i].to.id,
                y: this.transactions[i].year,
                a: this.transactions[i].amount,
                r: this.transactions[i].amountRef,
                rc: this.transactions[i].repetitionCount,
            }
        }
        return jsonRep;
    }
    
    this.applyJSonRep = function(jsonRep) {
        this.lifeExpectancy = jsonRep.le;
        this.udFormulaKey = jsonRep.f;
        this.referenceFrameKey = jsonRep.r;
        this.referenceFrames[this.MONETARY_UNIT_REF_KEY].logScale = jsonRep.rs.mu.log;
        this.referenceFrames[this.DIVIDEND_REF_KEY].logScale = jsonRep.rs.ud.log;
        this.referenceFrames[this.AVERAGE_REF_KEY].logScale = jsonRep.rs.mn.log;
        this.dividendStart = jsonRep.ud0;
        this.timeLowerBoundInYears = jsonRep.tm;
        this.timeUpperBoundInYears = jsonRep.tM;
        this.calculateGrowth = jsonRep.cc;
        this.growthTimeUnit = jsonRep.cu;
        this.growth = jsonRep.c;
        this.demographicProfileKey = jsonRep.d;
        this.maxDemography = jsonRep.dyM;
        this.xMinDemography = jsonRep.dxm;
        this.xMaxDemography = jsonRep.dxM;
        this.xMpvDemography = jsonRep.dxPv;
        this.plateauDemography = jsonRep.dp;
        this.xScaleDemography = jsonRep.dxs;
        
        this.accounts = [];
        var accountCount = jsonRep.ac;
        for (var i = 0; i < accountCount; i++) {
            var accountDescr = jsonRep['a' + i];
            this.accounts.push({
                id: accountDescr.id,
                birth: accountDescr.b,
                duration: accountDescr.d,
                balance: 0,
                startingPercentage: accountDescr.a0,
                type: accountDescr.t,
                values: [],
                x: [],
                y: []
            });
        }
        
        this.transactions = [];
        var transactionCount = jsonRep.tc;
        for (var i = 0; i < transactionCount; i++) {
            var transactionDescr = jsonRep['t' + i];
            this.transactions.push({
                id: transactionDescr.id,
                from: this.searchAccount(transactionDescr.f),
                to: this.searchAccount(transactionDescr.t),
                year: transactionDescr.y,
                amount: transactionDescr.a,
                amountRef: transactionDescr.r,
                repetitionCount: transactionDescr.rc
            });
        }
    }
    
    this.getDividend = function(timeStep) {
        if (timeStep < this.dividends.values.length) {
            return this.dividends.values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var dividend = 0;
        if (timeStep === moneyBirthStep) {
            dividend = this.getDividendStart();
        }
        else if (timeStep > moneyBirthStep) {
            // After first issuance, calculate next dividend depending on formula...
            dividend = this.udFormulas[this.udFormulaKey].calculate(this, timeStep);
        }
        return dividend;
    };
   
    this.getMonetarySupply = function(timeStep) {
        if (timeStep < this.monetarySupplies.values.length) {
            return this.monetarySupplies.values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var monetarySupply = 0;
       
        if (timeStep >= moneyBirthStep) {
            var currentDividend = this.getDividend(timeStep);
            var currentDemography = this.demographicProfiles[this.demographicProfileKey].calculate(this, this.getTimeValue(timeStep, this.YEAR));
            monetarySupply = this.getMonetarySupply(timeStep - 1);
            monetarySupply += currentDemography * currentDividend;
        }

        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            monetarySupply += this.getAccountIncrease(this.accounts[iAccount], timeStep);
        }
       
        return monetarySupply;
    };

    this.getAccountBalance = function(account, timeStep, dontUseCache) {
        if (!dontUseCache && timeStep < account.values.length) {
            return account.values[timeStep];
        }
        var balance = 0;
       
        if (timeStep > 0) {
            balance = this.getAccountBalance(account, timeStep - 1);
        }
       
        balance += this.getAccountIncrease(account, timeStep);
        
        return balance;
    };
   
    this.getAccountIncrease = function(account, timeStep) {
        var accountIncrease = 0;
        var birthStep = this.getTimeStep(account.birth, this.YEAR);
        if (this.isAlive(account, timeStep) && this.isCoCreator(account)) {
            // Add a dividend coming from producer
            accountIncrease = this.getDividend(timeStep);
        }

        var startingRatio = account.startingPercentage / 100;
        if (startingRatio != 0) {
            // At birth, add some money according to the 'startingPercentage' attribute
            var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
            if (birthStep === moneyBirthStep) {
                if (timeStep === moneyBirthStep - 1) {
                    // If this account starts at the same time as the currency, the amount to add is a ratio of UD0/c.
                    // We artificially add this money to this account just before it exists.
                    accountIncrease += startingRatio * this.getDividend(moneyBirthStep) / this.getGrowth();
                }
            }
            else if (timeStep === birthStep) {
                // If this account starts later than the currency, the amount to add is a ratio of M/N.
                accountIncrease += startingRatio * this.getMonetarySupply(timeStep - 1) / this.getHeadcount(timeStep - 1);
            }
        }
       
        return accountIncrease;
    }
   
    this.applyTransactions = function(timeStep, accountToComment) {
        var initializedAccounts = [];
        function initBalance(timeStep, initializedAccounts, account, money) {
            if (initializedAccounts.indexOf(account) == -1) {
                account.values[timeStep] = money.getAccountBalance(account, timeStep, true);
                initializedAccounts.push(account);
            }
        }

        // commentsMap : transaction->(account->actualAmount) 
        var commentsMap = new Map();
        function addComment(commentsMap, transaction, account, actualAmount) {
            var actualAmountMap = commentsMap.get(transaction);
            if (!actualAmountMap) {
                actualAmountMap = new Map();
                commentsMap.set(transaction, actualAmountMap);
            }
            actualAmountMap.set(account, actualAmount);
        }
                
        var annualTransactions = this.transactions.filter(t=>this.validTransactionDate(t, timeStep));
        for (var i = 0; i < annualTransactions.length; i++) {
            var fromAccounts = this.searchFromAccounts(annualTransactions[i], timeStep);
            var toAccounts = this.searchToAccounts(annualTransactions[i], timeStep);
            if (fromAccounts.length > 0 && toAccounts.length > 0) {
                // Loop over the origin of each annual transactions
                fromAccounts.forEach(function(fromAccount) {
                    initBalance(timeStep, initializedAccounts, fromAccount, this);
                    // Compute actual balance (other transactions can have decreased it)
                    var actualBalance = fromAccount.values[timeStep] - this.getAccountIncrease(fromAccount, timeStep);
                    var muAmount = this.referenceFrames[annualTransactions[i].amountRef].invTransform(this, annualTransactions[i].amount, timeStep, actualBalance);
                    // Apply transaction, actual amount depends on the solvency of the account
                    var actualAmount = Math.min(muAmount, actualBalance);
                    fromAccount.values[timeStep] = fromAccount.values[timeStep] - actualAmount;

                    // Loop over the destination of each annual transactions
                    toAccounts.forEach(function(toAccount) {
                        initBalance(timeStep, initializedAccounts, toAccount, this);
                        toAccount.values[timeStep] = toAccount.values[timeStep] + actualAmount / toAccounts.length;
                        if (accountToComment == toAccount) {
                            addComment(commentsMap, annualTransactions[i], fromAccount, actualAmount / toAccounts.length);
                        }
                        else if (accountToComment == fromAccount) {
                            addComment(commentsMap, annualTransactions[i], toAccount, -actualAmount / toAccounts.length);
                        }
                    }, this);
                }, this);
            }
        }
        return commentsMap;
    }

    this.searchFromAccounts = function(transaction, timeStep) {
        var accounts;
        if (transaction.from.id == -1) {
            accounts = this.accounts.filter(a=>a.id != transaction.to.id);
        }
        else {
            accounts = [transaction.from];
        }
        return accounts.filter(a=>this.isAlive(a, timeStep));
    }

    this.searchToAccounts = function(transaction, timeStep) {
        var accounts;
        if (transaction.to.id == -1) {
            accounts = this.accounts.filter(a=>a.id != transaction.from.id);
        }
        else {
            accounts = [transaction.to];
        }
        return accounts.filter(a=>this.isAlive(a, timeStep));
    }

    this.validTransactionDate = function(transaction, timeStep) {
        var firstTransStep = this.getTimeStep(transaction.year, this.YEAR);
        var lastTransStep = this.getTimeStep(transaction.year, this.YEAR) + this.getTimeStep(transaction.repetitionCount - 1, this.growthTimeUnit);
        return timeStep >= firstTransStep && timeStep <= lastTransStep;
    }

    this.getAverage = function(timeStep) {
        var average = 0;
        var headcount = this.getHeadcount(timeStep);
       
        if (headcount > 0) {
            average = this.getMonetarySupply(timeStep) / headcount;
        }

        return average;
    };
   
    /**
     * add a member account with same attributes as the last account
     */
    this.addAccount = function() {
        var id = 1;
        var birth = this.DEFAULT_MONEY_BIRTH;
        var startingPercentage = this.DEFAULT_STARTING_PERCENT;
        var type = this.CO_CREATOR;
        if (this.accounts.length > 0) {
            id = this.accounts[this.accounts.length - 1].id + 1;
            birth = this.accounts[this.accounts.length - 1].birth;
            startingPercentage = this.accounts[this.accounts.length - 1].startingPercentage;
            type = this.accounts[this.accounts.length - 1].type;
        }
       
        this.accounts.push({
            id: id,
            birth: birth,
            duration: this.lifeExpectancy,
            balance: 0,
            startingPercentage: startingPercentage,
            type: type,
            values: [],
            x: [],
            y: []
        });
    };

    this.searchAccount = function(accountId) {
        if (accountId == -1) {
            return this.ALL_ACCOUNT;
        }
        for (var i = 0; i < this.accounts.length; i++) {
            if (this.accounts[i].id == accountId) {
                return this.accounts[i];
            }
        };
        return null;
    }

    this.isAlive = function(account, timeStep) {
        var birthStep = this.getTimeStep(account.birth, this.YEAR);
        var deathStep = this.getTimeStep(account.birth + account.duration, this.YEAR);
        return timeStep >= birthStep && timeStep < deathStep;
    }
        
    this.isCoCreator = function(account) {
        return account.type == this.CO_CREATOR;
    }

    this.isNonCreator = function(account) {
        return account.type == this.NON_CREATOR;
    }

    this.isCommunity = function(account) {
        return account.type == this.COMMUNITY;
    }

    /**
     * Add a default transaction between first and second account (or between the first account if only one exist).
     */
    this.addTransaction = function() {
        var id = 1;
        var account1 = this.accounts[0];
        var account2 = this.accounts[0];
        if (this.accounts.length > 1) {
            account2 = this.accounts[1];
        }
        var year = account1.birth;
        var amount = this.DEFAULT_TRANSACTION_AMOUNT;
        var amountRef = this.MONETARY_UNIT_REF_KEY;
        var repetitionCount = 1;

        // If other transactions exist, init from last transaction
        if (this.transactions.length > 0) {
            var lastTransaction = this.transactions[this.transactions.length - 1];
            id = lastTransaction.id + 1;
            account1 = lastTransaction.from;
            account2 = lastTransaction.to;
            year = lastTransaction.year;
            amount = lastTransaction.amount;
            amountRef = lastTransaction.amountRef;
            repetitionCount = lastTransaction.repetitionCount;
        }
        
        this.transactions.push({
            id: id,
            from: account1,
            to: account2,
            year: year,
            amount: amount,
            amountRef: amountRef,
            repetitionCount: repetitionCount
        });
    };

    this.getGrowth = function(growthTimeUnit) {
        growthTimeUnit = growthTimeUnit || this.growthTimeUnit;
       
        if (growthTimeUnit === this.growthTimeUnit) {
            return this.growth;
        }
        if (growthTimeUnit === this.MONTH) {
            return Math.pow((1 + this.growth), 1/12) - 1;
        }
        if (growthTimeUnit === this.YEAR) {
            return Math.pow((1 + this.growth), 12) - 1;
        }
        throw new Error("Growth time unit not managed");
    }
       
    this.getTimeUpperBound = function(timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
        if (timeUnit === this.MONTH) {
            return 12 * this.timeUpperBoundInYears;
        }
        if (timeUnit === this.YEAR) {
            return this.timeUpperBoundInYears;
        }
        throw new Error("Time unit not managed: " + timeUnit);
    }
   
    this.setTimeUpperBound = function(timeValue) {
        this.timeUpperBoundInYears = timeValue;
        if (this.timeUpperBoundInYears <= this.timeLowerBoundInYears) {
            this.timeLowerBoundInYears = this.timeUpperBoundInYears - 1;
        }
    }
    
    this.getTimeLowerBound = function(timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
        if (timeUnit === this.MONTH) {
            return 12 * this.timeLowerBoundInYears;
        }
        if (timeUnit === this.YEAR) {
            return this.timeLowerBoundInYears;
        }
        throw new Error("Time unit not managed: " + timeUnit);
    }
   
    this.setTimeLowerBound = function(timeValue) {
        this.timeLowerBoundInYears = timeValue;
        if (this.timeUpperBoundInYears <= this.timeLowerBoundInYears) {
            this.timeUpperBoundInYears = this.timeLowerBoundInYears + 1;
        }
    }
    
    this.getTimeStep = function(timeValue, timeUnit) {
        if (timeUnit === this.growthTimeUnit) {
            return timeValue;
        }
        if (timeUnit === this.MONTH) {
            return timeValue / 12;
        }
        if (timeUnit === this.YEAR) {
            return timeValue * 12;
        }
        throw new Error("Time unit not managed");
    }
   
    this.getTimeValue = function(timeStep, timeUnit) {
        if (timeUnit === this.growthTimeUnit) {
            return timeStep;
        }
        if (timeUnit === this.YEAR) {
            return timeStep / 12;
        }
        if (timeUnit === this.MONTH) {
            return timeStep * 12;
        }
        throw new Error("Time unit not managed");
    }
   
    this.getDividendStart = function(growthTimeUnit) {
        growthTimeUnit = growthTimeUnit || this.growthTimeUnit;
       
        if (growthTimeUnit === this.growthTimeUnit) {
            return this.dividendStart;
        }
        if (growthTimeUnit === this.MONTH) {
            return this.dividendStart * this.getGrowth(this.MONTH) / this.getGrowth(this.YEAR);
        }
        if (growthTimeUnit === this.YEAR) {
            return this.dividendStart * this.getGrowth(this.YEAR) / this.getGrowth(this.MONTH);
        }
        throw new Error("Growth time unit not managed");
    }
   
    /**
     * Return account deleted or false for first account
     *
     * @returns {*}|false
     */
    this.deleteAccount = function(accountIndex) {
        if (accountIndex == 0) {
            return false;
        }
        if (accountIndex > 0 && accountIndex < this.accounts.length) {
            var deletedAccount = this.accounts.splice(accountIndex, 1);
            this.deleteTransactions(deletedAccount);
            return deletedAccount;
        }
        throw new Error(accountIndex + "is an invalid account index");
    };
   
    this.getAccount = function(accountIndex) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex];
        }
        throw new Error(accountIndex + "is an invalid account index");
    };

    this.deleteTransactions = function(account) {
        for (var i = this.transactions.length - 1; i >= 0; i--) {
            if (this.transactions[i].from == account ||  this.transactions[i].to == account) {
              this.transactions.splice(i, 1);
            }
        }
    };
   
    this.deleteTransaction = function(transactionIndex) {
        if (transactionIndex >= 0 && transactionIndex < this.transactions.length) {
            return this.transactions.splice(transactionIndex, 1);
        }
        throw new Error(transactionIndex + "is an invalid transaction index");
    };
   
    this.getTransaction = function(transactionIndex) {
        if (transactionIndex >= 0 && transactionIndex < this.transactions.length) {
            return this.transactions[transactionIndex];
        }
        throw new Error(transactionIndex + "is an invalid transaction index");
    };

    this.generateData = function () {

        if (this.calculateGrowth) {
            this.calcGrowth();
        }

        // **************
        // Reset data
        // **************
        
        this.dividends = {values : [], x: [], y: []};
        this.stableDividends = {x: [], y: []};
        this.headcounts = {values : [], x: [], y: []};
        this.monetarySupplies = {values : [], x: [], y: []};
        this.stableMonetarySupplies = {x: [], y: []};
        this.averages = {x: [], y: []};
        this.stableAverages = {x: [], y: []};
        this.resetAccounts();
        this.resetMoneyBirth();

        // **************
        // Calculate data
        // **************
           
        var iAccount, timeStep;
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        
        for (timeStep = 0; timeStep <= this.getTimeUpperBound(); timeStep++) {
           
            this.headcounts.values.push(this.getHeadcount(timeStep));
            this.dividends.values.push(this.getDividend(timeStep));
            this.monetarySupplies.values.push(this.getMonetarySupply(timeStep));
            for (iAccount = 0; iAccount < this.accounts.length; iAccount++) {
                this.accounts[iAccount].values.push(this.getAccountBalance(this.accounts[iAccount], timeStep));
            }
            this.applyTransactions(timeStep);
        }

        // **************
        // Set x,y arrays
        // **************
        
        for (timeStep = this.getTimeLowerBound(); timeStep <= this.getTimeUpperBound(); timeStep++) {
           
            if (timeStep >= moneyBirthStep) {
                this.dividends.x.push(timeStep);
                this.dividends.y.push(this.applyPov(this.getDividend(timeStep), timeStep));
               
                this.stableAverages.x.push(timeStep);
                this.stableAverages.y.push(this.applyPov((1 + this.getGrowth()) * this.getDividend(timeStep) / this.getGrowth(), timeStep));
               
                this.monetarySupplies.x.push(timeStep);
                this.monetarySupplies.y.push(this.applyPov(this.getMonetarySupply(timeStep), timeStep));
               
                this.stableMonetarySupplies.x.push(timeStep);
                this.stableMonetarySupplies.y.push(this.applyPov(this.getHeadcount(timeStep) * (1 + this.getGrowth()) * this.getDividend(timeStep) / this.getGrowth(), timeStep));
            }
           
            if (timeStep >= moneyBirthStep && this.headcounts.values[timeStep] > 0) {
                this.averages.x.push(timeStep);
                this.averages.y.push(this.applyPov(this.getAverage(timeStep), timeStep));
               
                this.stableDividends.x.push(timeStep);
                this.stableDividends.y.push(this.applyPov(this.getGrowth() * this.getMonetarySupply(timeStep) / this.getHeadcount(timeStep) / (1 + this.getGrowth()), timeStep));
            }
           
            this.headcounts.x.push(timeStep);
            this.headcounts.y.push(this.headcounts.values[timeStep]);
           
            for (iAccount = 0; iAccount < this.accounts.length; iAccount++) {

                var birthStep = this.getTimeStep(this.accounts[iAccount].birth, this.YEAR);
                // if account is born...
                if (timeStep >= birthStep) {
                    this.accounts[iAccount].x.push(timeStep);
                    this.accounts[iAccount].y.push(this.applyPov(this.getAccountBalance(this.accounts[iAccount], timeStep), timeStep));
                }
            }
        }
        this.adaptYValues();
    };

    /**
     * Transform data to another reference frame
     *
     * @param value {int}   Source value
     * @returns {number|*}
     */
    this.applyPov = function (value, timeStep) {
        var referenceValue = this.referenceFrames[this.referenceFrameKey].transform(this, value, timeStep);
        if (this.referenceFrames[this.referenceFrameKey].logScale) {
            return Math.log(referenceValue) / Math.log(10);
        }
        return referenceValue;
    }
    
    /**
     * - since infinity value is not well managed by C3.js, replace it by a value easily recognizable and greater than all other values;
     * - round values to avoid noises (due to numerical instability) in constant series of values.
     */
    this.adaptYValues = function () {
        
        var maxAbs1 = this.maxAbs(this.dividends.y, 0);
        maxAbs1 = this.maxAbs(this.stableDividends.y, maxAbs1);
        
        this.adaptValues(this.dividends.y, maxAbs1);
        this.adaptValues(this.stableDividends.y, maxAbs1);
        
        var maxAbs2 = this.maxAbs(this.monetarySupplies.y, 0);
        maxAbs2 = this.maxAbs(this.stableMonetarySupplies.y, maxAbs2);
        
        this.adaptValues(this.monetarySupplies.y, maxAbs2);
        this.adaptValues(this.stableMonetarySupplies.y, maxAbs2);
        
        var maxAbs3 = this.maxAbs(this.averages.y, 0);
        maxAbs3 = this.maxAbs(this.stableAverages.y, maxAbs3);
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            maxAbs3 = this.maxAbs(this.accounts[iAccount].y, maxAbs3);
        }
        
        this.adaptValues(this.averages.y, maxAbs3);
        this.adaptValues(this.stableAverages.y, maxAbs3);
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            this.adaptValues(this.accounts[iAccount].y, maxAbs3);
        }
    }
    
    this.adaptValues = function (yArray, maxAbs) {
        var substitute = Math.pow(10, Math.ceil(Math.log(maxAbs * 2) / Math.log(10))) * this.INFINITY_FACTOR;
        for (i = 0; i < yArray.length; i++) {
            if (yArray[i] == Number.NEGATIVE_INFINITY) {
                // Replace NEGATIVE_INFINITY by a value easily recognizable and smaller than all other values
                yArray[i] = - substitute;
            }
            else if (yArray[i] == Number.POSITIVE_INFINITY) {
                // Replace POSITIVE_INFINITY by a value easily recognizable and greater than all other values
                yArray[i] = substitute;
            }
            else {
                // Round values to avoid noises (due to numerical instability) in constant series of values
                yArray[i] = Math.round(yArray[i]*100000)/100000;
            }
        }
    }
    
    this.maxAbs = function (array, defaultMax) {
        var maxAbs = defaultMax;
        for (var i = 0; i < array.length; i++) {
            if (array[i] != Number.NEGATIVE_INFINITY &&  array[i] != Number.POSITIVE_INFINITY) {
                var curAbs = Math.abs(array[i]);
                if (curAbs > maxAbs) {
                    maxAbs = curAbs;
                }
            }
        }
        return maxAbs;
    }
    
    this.isInfinite = function (value) {
        if (value === 0) {
            return 0;
        }
        var epsilon = 0.0001;
        var exp = Math.log(Math.abs(value) / this.INFINITY_FACTOR) / Math.log(10);
        if (Math.abs(exp - Math.round(exp)) < epsilon) {
            return value;
        }
        return 0;
    }
    
};