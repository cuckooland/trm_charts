// eslint-disable-next-line no-unused-vars
class LibreCurrency {

    static readonly YEAR: string = "YEAR";
    static readonly MONTH = "MONTH";
   
    static readonly CO_CREATOR = "CC";
    static readonly NON_CREATOR = "NC";
    static readonly COMMUNITY = "COM";
    static readonly ACCOUNT_TYPES = [LibreCurrency.CO_CREATOR, LibreCurrency.NON_CREATOR, LibreCurrency.COMMUNITY];

    static readonly INFINITY_FACTOR = 1.234567;
    
    // Default Values
    static readonly LIFE_EXPECTANCY = 80;
    static readonly DIVIDEND_START = 1000;
    static readonly TIME_LOWER_BOUND_IN_YEARS = 0;
    static readonly TIME_UPPER_BOUND_IN_YEARS = 5;
    static readonly CALCULATE_GROWTH = true;
    static readonly PER_YEAR_GROWTH = 20;
    static readonly PER_MONTH_GROWTH = 2;
    static readonly MAX_DEMOGRAPHY = 10000;
    static readonly XMIN_DEMOGRAPHY = 0;
    static readonly XMAX_DEMOGRAPHY = 80;
    static readonly XMPV_DEMOGRAPHY = 40;
    static readonly PLATEAU_DEMOGRAPHY = 78;
    static readonly XSCALE_DEMOGRAPHY = 4;
    static readonly DEFAULT_MONEY_BIRTH = 1;
    static readonly DEFAULT_STARTING_PERCENT = 0;
    static readonly DEFAULT_TRANSACTION_AMOUNT = 10;

    // @ts-ignore
    static readonly ALL_ACCOUNT: MAccount = {
        id: -1
    };
    
    static readonly referenceFrames: {[s: string]: ReferenceFrame} = {
        "monetaryUnit": {
            transform: function(_money: LibreCurrency, value: number, _timeStep: number, _amountRef?: number) {
                return value;
            },
            invTransform: function(_money: LibreCurrency, value: number, _timeStep: number, _amountRef?: number) {
                return value;
            },
            logScale: false
        },
        "dividend": {
            transform: function(money: LibreCurrency, value: number, timeStep: number, _amountRef?: number) {
                if (!money.dividends.values[timeStep]) {
                    return NaN;
                }
                return value / money.dividends.values[timeStep];
            },
            invTransform: function(money: LibreCurrency, value: number, timeStep: number, _amountRef?: number) {
                return value * money.dividends.values[timeStep];
            },
            logScale: false
        },
        "average": {
            transform: function(money: LibreCurrency, value: number, timeStep: number, _amountRef?: number) {
                if (!money.monetarySupplies.values[timeStep] || !money.headcounts.values[timeStep]) {
                    return NaN;
                }
                return value / money.monetarySupplies.values[timeStep] * money.headcounts.values[timeStep] * 100;
            },
            invTransform: function(money: LibreCurrency, value: number, timeStep: number, _amountRef?: number) {
                return value * money.monetarySupplies.values[timeStep] / money.headcounts.values[timeStep] / 100;
            },
            logScale: false
        },
        "account": {
            transform: function(_money: LibreCurrency, value: number, _timeStep: number, amountRef?: number) {
                // @ts-ignore
                return value / amountRef * 100;
            },
            invTransform: function(_money: LibreCurrency, value: number, _timeStep: number, amountRef?: number) {
                // @ts-ignore
                return value * amountRef / 100;
            },
            logScale: false
        }
    };
   
    // dididend formulas
    static readonly udFormulas: {[s: string]: UdFormula} = {
        "BasicUD": {
            // BasicUD(t+dt) = c*M(t)/N(t)
            calculate: function (money: LibreCurrency, timeStep: number) {
                const headcount = money.headcounts.values[timeStep - 1]
                if (headcount > 0) {
                    const monetarySupply = money.getMonetarySupply(timeStep - 1);
                    return money.getGrowth() * (monetarySupply / headcount);
                } else {
                    // In this special case, the next UD is the same as the current
                    return money.dividends.values[timeStep - 1] * money.prodFactor();
                }
            }
        },
        "UDA": {
            // UDA(t+dt) = Max[UDA(t) ; c*M(t)/N(t)]
            calculate: function (money: LibreCurrency, timeStep: number) {
                const dividend = money.dividends.values[timeStep - 1] * money.prodFactor();
                const headcount = money.headcounts.values[timeStep - 1]
                if (headcount > 0) {
                    const monetarySupply = money.getMonetarySupply(timeStep - 1);
                    return Math.max(dividend, money.getGrowth() * (monetarySupply / headcount));
                } else {
                    // In this special case, the next UD is the same as the current
                    return dividend;
                }
            }
        },
        "UDB": {
            // UDB(t+dt) = (1+c)*UDB(t)
            calculate: function (money: LibreCurrency, timeStep: number) {
                const dividend = money.dividends.values[timeStep - 1] * money.prodFactor();
                const headcount = money.headcounts.values[timeStep - 1]
                if (headcount > 0) {
                    return dividend * (1 + money.getGrowth());
                } else {
                    // In this special case, the next UD is the same as the current
                    return dividend;
                }
            }
        },
        "UDC": {
            // UDC(t+dt) = 1/2*(UDBasique + UDB)
            calculate: function (money: LibreCurrency, timeStep: number) {
                const dividend = money.dividends.values[timeStep - 1] * money.prodFactor();
                const headcount = money.headcounts.values[timeStep - 1]
                if (headcount > 0) {
                    const monetarySupply = money.getMonetarySupply(timeStep - 1);
                    const udBasic = money.getGrowth() * (monetarySupply / headcount);
                    const udb = dividend * (1 + money.getGrowth());
                    return (udBasic + udb) / 2;
                } else {
                    // In this special case, the next UD is the same as the current
                    return dividend;
                }
            }
        },
        "UDG": {
            // DU(t+dt) = DU(t) + c² M(t)/N(t)
            calculate: function (money: LibreCurrency, timeStep: number) {
                const dividend = money.dividends.values[timeStep - 1] * money.prodFactor();
                const headcount = money.headcounts.values[timeStep - 1]
                const previousHeadcount = money.headcounts.values[money.previousGrowthStep(timeStep - 1)]
                if (previousHeadcount > 0 && headcount > 0) {
                    const previousMonetarySupply = money.monetarySupplies.values[money.previousGrowthStep(timeStep - 1)];
                    return dividend + (Math.pow(money.getGrowth(), 2) * (previousMonetarySupply / previousHeadcount));
                }
                else {
                    // In this special case, the next UD is the same as the current
                    return dividend;
                }
            }
        }
    };
   
    // population variation profiles
    static readonly demographicProfiles: {[s: string]: DemographicProfile} = {
        "None": {
            calculate: function (_money: LibreCurrency, _year: number) {
                return 0;
            }
        },
        "Triangular": {
            calculate: function (money: LibreCurrency, year: number) {
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
        "Plateau": {
            calculate: function (money: LibreCurrency, year: number) {
                const slopeDuration = ((money.xMaxDemography - money.xMinDemography) - money.plateauDemography) / 2;
                const xMean1 = money.xMinDemography + slopeDuration;
                const xMean2 = money.xMaxDemography - slopeDuration;
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
        "Cauchy": {
            calculate: function (money: LibreCurrency, year: number) {
                const tmp = (year - money.xMpvDemography) / money.xScaleDemography;
                return Math.trunc(money.maxDemography / (1 + tmp * tmp));
            }
        },
        "DampedWave": {
            calculate: function (money: LibreCurrency, year: number) {
                const x = year / (2 * money.xScaleDemography);
               
                return Math.trunc(money.maxDemography * (1 - Math.cos(2*x) / (1 + x * x)));
            }
        },
        "Sigmoid": {
            calculate: function (money: LibreCurrency, year: number) {
                const s = money.xScaleDemography;
                return Math.trunc(money.maxDemography * (1 / (1 + s * 100 * Math.exp(-0.6 * year / s))));
            }
        }
    };

    static readonly MONETARY_UNIT_REF_KEY = Object.keys(LibreCurrency.referenceFrames)[0];
    static readonly DIVIDEND_REF_KEY = Object.keys(LibreCurrency.referenceFrames)[1];
    static readonly AVERAGE_REF_KEY = Object.keys(LibreCurrency.referenceFrames)[2];
    static readonly ACCOUNT_REF_KEY = Object.keys(LibreCurrency.referenceFrames)[3];

    static readonly BASIC_UD_KEY = Object.keys(LibreCurrency.udFormulas)[0];
    static readonly UDA_KEY = Object.keys(LibreCurrency.udFormulas)[1];
    static readonly UDB_KEY = Object.keys(LibreCurrency.udFormulas)[2];
    static readonly UDC_KEY = Object.keys(LibreCurrency.udFormulas)[3];
    static readonly UDG_KEY = Object.keys(LibreCurrency.udFormulas)[4];

    static readonly NONE_PROFILE_KEY = Object.keys(LibreCurrency.demographicProfiles)[0];
    static readonly TRIANGULAR_PROFILE_KEY = Object.keys(LibreCurrency.demographicProfiles)[1];
    static readonly PLATEAU_PROFILE_KEY = Object.keys(LibreCurrency.demographicProfiles)[2];
    static readonly CAUCHY_PROFILE_KEY = Object.keys(LibreCurrency.demographicProfiles)[3];
    static readonly DAMPEDWAVE_PROFILE_KEY = Object.keys(LibreCurrency.demographicProfiles)[4];
    static readonly SIGMOID_PROFILE_KEY = Object.keys(LibreCurrency.demographicProfiles)[5];

    moneyBirth = -1;
    // @type {int} Members life expectancy
    lifeExpectancy = LibreCurrency.LIFE_EXPECTANCY;
    // @type {int} First dividend amount (at first year or first month, it depends of 'prodStepUnit')
    dividendStart = LibreCurrency.DIVIDEND_START;
    // @type {int} Time lower bound for plot generation
    timeLowerBoundInYears = LibreCurrency.TIME_LOWER_BOUND_IN_YEARS;
    // @type {int} Time upper bound for plot generation
    timeUpperBoundInYears = LibreCurrency.TIME_UPPER_BOUND_IN_YEARS;

    // @type {boolean} Indicate if growth has to be calculated from life expectancy
    calculateGrowth = LibreCurrency.CALCULATE_GROWTH;
    growth = LibreCurrency.PER_YEAR_GROWTH;
    // @type {String} Indicate the rythm of the re-evaluation of the dividend (YEAR or MONTH)
    growthStepUnit = LibreCurrency.YEAR;
    // @type {String} Indicate the rythm of the dividend creation (YEAR or MONTH)
    prodStepUnit = LibreCurrency.YEAR;
    // @type {int} Order of magnitude of the maximum demography
    maxDemography = LibreCurrency.MAX_DEMOGRAPHY;
    xMinDemography = LibreCurrency.XMIN_DEMOGRAPHY;
    xMaxDemography = LibreCurrency.XMAX_DEMOGRAPHY;
    xMpvDemography = LibreCurrency.XMPV_DEMOGRAPHY;
    plateauDemography = LibreCurrency.PLATEAU_DEMOGRAPHY;
    xScaleDemography = LibreCurrency.XSCALE_DEMOGRAPHY;
    dividends: ValuesXY = {values : [], x: [], y: []};
    stableDividends: XY = {x: [], y: []};
    headcounts: ValuesXY = {values : [], x: [], y: []};
    monetarySupplies: ValuesXY = {values : [], x: [], y: []};
    stableMonetarySupplies: XY = {x: [], y: []};
    averages: XY = {x: [], y: []};
    stableAverages: XY = {x: [], y: []};
    accounts: MAccount[] = [];
    transactions: Transaction[] = [];
   
    referenceFrameKey = LibreCurrency.MONETARY_UNIT_REF_KEY;

    udFormulaKey = LibreCurrency.BASIC_UD_KEY;

    demographicProfileKey = LibreCurrency.NONE_PROFILE_KEY;

    constructor(lifeExpectancy?: number) {
        this.lifeExpectancy = lifeExpectancy || LibreCurrency.LIFE_EXPECTANCY;

        // {double} Monetary supply growth in percent (per year or per month, it depends of 'growthStepUnit')
        if (this.growthStepUnit === LibreCurrency.MONTH) {
            this.growth = LibreCurrency.PER_MONTH_GROWTH;
        }
        else if (this.growthStepUnit === LibreCurrency.YEAR) {
            this.growth = LibreCurrency.PER_YEAR_GROWTH;
        }
        else {
            throw new Error("Growth time unit not managed");
        }
    }
   
    previousGrowthStep(timeStep: number) {
        return timeStep - this.prodFactor();
    }

    prodFactor() {
        if (this.growthStepUnit === LibreCurrency.YEAR && this.prodStepUnit === LibreCurrency.MONTH) {
            return 12;
        }
        return 1;
    }

    getProdStepUnit() {
        if (this.growthStepUnit === LibreCurrency.MONTH || (this.growthStepUnit === LibreCurrency.YEAR && this.prodStepUnit === LibreCurrency.MONTH)) {
            return LibreCurrency.MONTH;
        }
        if (this.growthStepUnit === LibreCurrency.YEAR) {
            return LibreCurrency.YEAR;
        }
        throw new Error("Time unit not managed: " + this.growthStepUnit);
    }
    
    resetAccounts() {
        for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            this.accounts[iAccount].balance = 0;
            this.accounts[iAccount].values = [];
            this.accounts[iAccount].x = [];
            this.accounts[iAccount].y = [];
        }
    }

    resetMoneyBirth() {
        let moneyBirth = +Infinity;
        for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            moneyBirth = Math.min(moneyBirth, this.accounts[iAccount].birth);
        }
        this.moneyBirth = moneyBirth;
    }
   
    calcGrowth() {
        const growthPerYear = Math.pow(this.lifeExpectancy / 2, 2 / this.lifeExpectancy) - 1;
        if (this.growthStepUnit === LibreCurrency.YEAR) {
            this.growth = growthPerYear;
        }
        else if (this.growthStepUnit === LibreCurrency.MONTH) {
            this.growth = Math.pow((1 + growthPerYear), 1/12) - 1;
        }
        else {
            throw new Error("Growth time unit not managed");
        }
    }

    getHeadcount(timeStep: number) {
        if (timeStep < this.headcounts.values.length) {
            return this.headcounts.values[timeStep];
        }
        let headcount = 0;
        const noCoCreators = this.hasNoCoCreators();

        for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            if (this.isAlive(this.accounts[iAccount], timeStep/* -1 */) 
                && !LibreCurrency.isCommunity(this.accounts[iAccount])
                && (noCoCreators || LibreCurrency.isCoCreator(this.accounts[iAccount]))) {
                headcount = headcount + 1;
            }
        }
        
        return headcount + LibreCurrency.demographicProfiles[this.demographicProfileKey].calculate(this, this.fromTimeStep(timeStep, LibreCurrency.YEAR));
    }

    hasNoCoCreators() {
        return (this.accounts.filter(account => LibreCurrency.isCoCreator(account)).length === 0);
    }

    // eslint-disable-next-line max-lines-per-function
    asJSonRep() {
        const jsonRep: ModelAsJSon = {
            f : this.udFormulaKey,
            r : this.referenceFrameKey,
            rs : {
                mu: {
                    log: LibreCurrency.referenceFrames[LibreCurrency.MONETARY_UNIT_REF_KEY].logScale
                },
                ud: {
                    log: LibreCurrency.referenceFrames[LibreCurrency.DIVIDEND_REF_KEY].logScale
                },
                mn: {
                    log: LibreCurrency.referenceFrames[LibreCurrency.AVERAGE_REF_KEY].logScale
                }
            },
            le : this.lifeExpectancy,
            ud0 : this.dividendStart,
            tm : this.timeLowerBoundInYears,
            tM : this.timeUpperBoundInYears,
            cc : this.calculateGrowth,
            cu : this.growthStepUnit,
            pu : this.prodStepUnit,
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
        for (let i = 0; i < this.accounts.length; i++) {
            // @ts-ignore
            jsonRep["a" + i] = {
                id: this.accounts[i].id,
                b: this.accounts[i].birth,
                d: this.accounts[i].duration,
                a0: this.accounts[i].startingPercentage,
                t: this.accounts[i].type
            }
        }
        for (let i = 0; i < this.transactions.length; i++) {
            // @ts-ignore
            jsonRep["t" + i] = {
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
    
    // eslint-disable-next-line max-lines-per-function
    applyJSonRep(jsonRep: ModelAsJSon) {
        this.lifeExpectancy = jsonRep.le;
        this.udFormulaKey = jsonRep.f;
        this.referenceFrameKey = jsonRep.r;
        LibreCurrency.referenceFrames[LibreCurrency.MONETARY_UNIT_REF_KEY].logScale = jsonRep.rs.mu.log;
        LibreCurrency.referenceFrames[LibreCurrency.DIVIDEND_REF_KEY].logScale = jsonRep.rs.ud.log;
        LibreCurrency.referenceFrames[LibreCurrency.AVERAGE_REF_KEY].logScale = jsonRep.rs.mn.log;
        this.dividendStart = jsonRep.ud0;
        this.timeLowerBoundInYears = jsonRep.tm;
        this.timeUpperBoundInYears = jsonRep.tM;
        this.calculateGrowth = jsonRep.cc;
        this.growthStepUnit = jsonRep.cu;
        this.prodStepUnit = jsonRep.pu;
        this.growth = jsonRep.c;
        this.demographicProfileKey = jsonRep.d;
        this.maxDemography = jsonRep.dyM;
        this.xMinDemography = jsonRep.dxm;
        this.xMaxDemography = jsonRep.dxM;
        this.xMpvDemography = jsonRep.dxPv;
        this.plateauDemography = jsonRep.dp;
        this.xScaleDemography = jsonRep.dxs;
        
        this.accounts = [];
        const accountCount = jsonRep.ac;
        for (let i = 0; i < accountCount; i++) {
            // @ts-ignore
            const accountDescr = jsonRep["a" + i] as JsonAccountRep;
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
        const transactionCount = jsonRep.tc;
        for (let i = 0; i < transactionCount; i++) {
            // @ts-ignore
            const transactionDescr = jsonRep["t" + i] as JsonTransactionRep;
            const from = this.searchAccount(transactionDescr.f);
            const to = this.searchAccount(transactionDescr.t);
            if (from !== null && to !== null) {
                this.transactions.push({
                    id: transactionDescr.id,
                    from: from,
                    to: to,
                    year: transactionDescr.y,
                    amount: transactionDescr.a,
                    amountRef: transactionDescr.r,
                    repetitionCount: transactionDescr.rc
                });
            }
        }
    }
    
    getDividend(timeStep: number) {
        if (timeStep < this.dividends.values.length) {
            return this.dividends.values[timeStep];
        }
        const moneyBirthStep = this.toTimeStep(this.moneyBirth, LibreCurrency.YEAR);
        let dividend = 0;
        if (timeStep === moneyBirthStep + 1) {
            dividend = this.getDividendStart();
        }
        else if (timeStep > moneyBirthStep + 1) {
            if (this.prodFactor() !== 1 && (timeStep - moneyBirthStep) % this.prodFactor() !== 1) {
                dividend = this.dividends.values[timeStep - 1];
            }
            else {
                dividend = LibreCurrency.udFormulas[this.udFormulaKey].calculate(this, timeStep) / this.prodFactor();
            }            
        }
        return dividend;
    }
   
    getMonetarySupply(timeStep: number) {
        if (timeStep < this.monetarySupplies.values.length) {
            return this.monetarySupplies.values[timeStep];
        }
        const moneyBirthStep = this.toTimeStep(this.moneyBirth, LibreCurrency.YEAR);
        let monetarySupply = 0;
       
        if (timeStep >= moneyBirthStep + 1) {
            const currentDividend = this.getDividend(timeStep);
            const currentDemography = LibreCurrency.demographicProfiles[this.demographicProfileKey].calculate(this, this.fromTimeStep(timeStep, LibreCurrency.YEAR));
            monetarySupply = this.getMonetarySupply(timeStep - 1);
            monetarySupply += currentDemography * currentDividend;
        }

        for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            monetarySupply += this.getAccountIncrease(this.accounts[iAccount], timeStep);
        }
       
        return monetarySupply;
    }

    getAccountBalance(account: MAccount, timeStep: number, dontUseCache?: boolean) {
        if (!dontUseCache && timeStep < account.values.length) {
            return account.values[timeStep];
        }
        let balance = 0;
       
        if (timeStep > 0) {
            balance = this.getAccountBalance(account, timeStep - 1);
        }
       
        balance += this.getAccountIncrease(account, timeStep);
        
        return balance;
    }
   
    getAccountIncrease(account: MAccount, timeStep: number) {
        let accountIncrease = 0;
        const birthStep = this.toTimeStep(account.birth, LibreCurrency.YEAR);
        if (this.isAlive(account, timeStep - 1) && LibreCurrency.isCoCreator(account)) {
            // Add a dividend coming from producer
            accountIncrease = this.getDividend(timeStep);
        }

        if (account.startingPercentage !== 0 && timeStep === birthStep) {
            // At birth, add some money according to the 'startingPercentage' attribute
            if (birthStep === this.toTimeStep(this.moneyBirth, LibreCurrency.YEAR)) {
                // If this account starts at the same time as the currency, the amount to add is a ratio of UD0/c.
                accountIncrease += account.startingPercentage / 100 * this.getDividendStart() * this.prodFactor() / this.getGrowth();
            }
            else {
                // If this account starts later than the currency, the amount to add is a ratio of M/N after emission of the dividend.
                accountIncrease += account.startingPercentage / 100 * (this.getMonetarySupply(timeStep - 1) / this.getHeadcount(timeStep - 1) + (this.hasNoCoCreators() ? 0 : this.getDividend(timeStep)));
            }
        }
       
        return accountIncrease;
    }
   
    applyTransactions(timeStep: number, accountToComment?: MAccount) {
        const thisLibreCurrency = this;
        const initializedAccounts: MAccount[] = [];
        function initBalance(aTimeStep: number, someInitializedAccounts: MAccount[], account: MAccount, money: LibreCurrency) {
            if (someInitializedAccounts.indexOf(account) === -1) {
                account.values[aTimeStep] = money.getAccountBalance(account, aTimeStep, true);
                someInitializedAccounts.push(account);
            }
        }

        // commentsMap : transaction->(account->actualAmount) 
        const commentsMap: Map<Transaction, Map<MAccount, number>> = new Map();
        function addComment(aCommentsMap: Map<Transaction, Map<MAccount, number>>, transaction: Transaction, account: MAccount, actualAmount: number) {
            let actualAmountMap = aCommentsMap.get(transaction);
            if (!actualAmountMap) {
                actualAmountMap = new Map();
                aCommentsMap.set(transaction, actualAmountMap);
            }
            actualAmountMap.set(account, actualAmount);
        }
                
        const annualTransactions = this.transactions.filter(t => this.validTransactionDate(t, timeStep));
        for (let i = 0; i < annualTransactions.length; i++) {
            const fromAccounts = this.searchFromAccounts(annualTransactions[i], timeStep);
            const toAccounts = this.searchToAccounts(annualTransactions[i], timeStep);
            if (fromAccounts.length > 0 && toAccounts.length > 0) {
                // Loop over the origin of each annual transactions
                fromAccounts.forEach(function(fromAccount) {
                    initBalance(timeStep, initializedAccounts, fromAccount, thisLibreCurrency);
                    // Compute actual balance (other transactions can have decreased it)
                    const actualBalance = fromAccount.values[timeStep] - thisLibreCurrency.getAccountIncrease(fromAccount, timeStep);
                    const muAmount = LibreCurrency.referenceFrames[annualTransactions[i].amountRef].invTransform(thisLibreCurrency, annualTransactions[i].amount, timeStep, actualBalance);
                    // Apply transaction, actual amount depends on the solvency of the account
                    const actualAmount = Math.min(muAmount, actualBalance);
                    fromAccount.values[timeStep] = fromAccount.values[timeStep] - actualAmount;

                    // Loop over the destination of each annual transactions
                    toAccounts.forEach(function(toAccount) {
                        initBalance(timeStep, initializedAccounts, toAccount, thisLibreCurrency);
                        toAccount.values[timeStep] = toAccount.values[timeStep] + actualAmount / toAccounts.length;
                        if (accountToComment === toAccount) {
                            addComment(commentsMap, annualTransactions[i], fromAccount, actualAmount / toAccounts.length);
                        }
                        else if (accountToComment === fromAccount) {
                            addComment(commentsMap, annualTransactions[i], toAccount, -actualAmount / toAccounts.length);
                        }
                    }, thisLibreCurrency);
                }, this);
            }
        }
        return commentsMap;
    }

    searchFromAccounts(transaction: Transaction, timeStep: number) {
        let accounts;
        if (transaction.from.id === -1) {
            accounts = this.accounts.filter(a => a.id !== transaction.to.id);
        }
        else {
            accounts = [transaction.from];
        }
        return accounts.filter(a => this.isBorn(a, timeStep - 1));
    }

    searchToAccounts(transaction: Transaction, timeStep: number) {
        let accounts;
        if (transaction.to.id === -1) {
            accounts = this.accounts.filter(a => a.id !== transaction.from.id);
        }
        else {
            accounts = [transaction.to];
        }
        return accounts.filter(a => this.isAlive(a, timeStep - 1));
    }

    validTransactionDate(transaction: Transaction, timeStep: number) {
        const firstTransStep = this.toTimeStep(transaction.year, LibreCurrency.YEAR);
        const lastTransStep = this.toTimeStep(transaction.year, LibreCurrency.YEAR) + this.toTimeStep(transaction.repetitionCount - 1, this.getProdStepUnit());
        return timeStep >= firstTransStep && timeStep <= lastTransStep;
    }

    getAverage(timeStep: number) {
        let average = 0;
        const headcount = this.getHeadcount(timeStep);
       
        if (headcount > 0) {
            average = this.getMonetarySupply(timeStep) / headcount;
        }

        return average;
    }
   
    /**
     * add a member account with same attributes as the last account
     */
    addAccount() {
        let id = 1;
        let birth = LibreCurrency.DEFAULT_MONEY_BIRTH;
        let startingPercentage = LibreCurrency.DEFAULT_STARTING_PERCENT;
        let type = LibreCurrency.CO_CREATOR;
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
    }

    searchAccount(accountId: number) {
        if (accountId === -1) {
            return LibreCurrency.ALL_ACCOUNT;
        }
        for (let i = 0; i < this.accounts.length; i++) {
            if (this.accounts[i].id === accountId) {
                return this.accounts[i];
            }
        }
        return null;
    }

    accountIndex(accountId: number) {
        for (let i = 0; i < this.accounts.length; i++) {
            if (this.accounts[i].id === accountId) {
                return i;
            }
        }
        return -1;
    }

    isAlive(account: MAccount, timeStep: number) {
        const birthStep = this.toTimeStep(account.birth, LibreCurrency.YEAR);
        const deathStep = this.toTimeStep(account.birth + account.duration, LibreCurrency.YEAR);
        return timeStep >= birthStep && timeStep < deathStep;
    }
        
    isBorn(account: MAccount, timeStep: number) {
        const birthStep = this.toTimeStep(account.birth, LibreCurrency.YEAR);
        return timeStep >= birthStep;
    }
        
    static isCoCreator(account: MAccount) {
        return account.type === LibreCurrency.CO_CREATOR;
    }

    static isNonCreator(account: MAccount) {
        return account.type === LibreCurrency.NON_CREATOR;
    }

    static isCommunity(account: MAccount) {
        return account.type === LibreCurrency.COMMUNITY;
    }

    /**
     * Add a default transaction between first and second account (or between the first account if only one exist).
     */
    addTransaction() {
        let id = 1;
        let account1 = this.accounts[0];
        let account2 = this.accounts[0];
        if (this.accounts.length > 1) {
            account2 = this.accounts[1];
        }
        let year = account1.birth;
        let amount = LibreCurrency.DEFAULT_TRANSACTION_AMOUNT;
        let amountRef = LibreCurrency.MONETARY_UNIT_REF_KEY;
        let repetitionCount = 1;

        // If other transactions exist, init from last transaction
        if (this.transactions.length > 0) {
            const lastTransaction = this.transactions[this.transactions.length - 1];
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
    }

    getGrowth(aTimeUnit?: string) {
        const timeUnit = aTimeUnit || this.growthStepUnit;
       
        if (timeUnit === this.growthStepUnit) {
            return this.growth;
        }
        if (timeUnit === LibreCurrency.MONTH) {
            return Math.pow((1 + this.growth), 1/12) - 1;
        }
        if (timeUnit === LibreCurrency.YEAR) {
            return Math.pow((1 + this.growth), 12) - 1;
        }
        throw new Error("Growth time unit not managed");
    }
       
    getTimeUpperBound(aTimeUnit?: string) {
        const timeUnit = aTimeUnit || this.getProdStepUnit();
        if (timeUnit === LibreCurrency.MONTH) {
            return 12 * this.timeUpperBoundInYears;
        }
        if (timeUnit === LibreCurrency.YEAR) {
            return this.timeUpperBoundInYears;
        }
        throw new Error("Time unit not managed: " + timeUnit);
    }
   
    setTimeUpperBound(timeValue: number) {
        this.timeUpperBoundInYears = timeValue;
        if (this.timeUpperBoundInYears <= this.timeLowerBoundInYears) {
            this.timeLowerBoundInYears = this.timeUpperBoundInYears - 1;
        }
    }
    
    getTimeLowerBound(aTimeUnit?: string) {
        const timeUnit = aTimeUnit || this.getProdStepUnit();
        if (timeUnit === LibreCurrency.MONTH) {
            return 12 * this.timeLowerBoundInYears;
        }
        if (timeUnit === LibreCurrency.YEAR) {
            return this.timeLowerBoundInYears;
        }
        throw new Error("Time unit not managed: " + timeUnit);
    }
   
    setTimeLowerBound(timeValue: number) {
        this.timeLowerBoundInYears = timeValue;
        if (this.timeUpperBoundInYears <= this.timeLowerBoundInYears) {
            this.timeUpperBoundInYears = this.timeLowerBoundInYears + 1;
        }
    }
    
    toTimeStep(inputValue: number, inputUnit: string) {
        if (inputUnit === this.getProdStepUnit()) {
            return inputValue;
        }
        if (inputUnit === LibreCurrency.MONTH) {
            return inputValue / 12;
        }
        if (inputUnit === LibreCurrency.YEAR) {
            return inputValue * 12;
        }
        throw new Error("Time unit not managed");
    }
   
    fromTimeStep(timeStep: number, outputUnit: string) {
        if (outputUnit === this.getProdStepUnit()) {
            return timeStep;
        }
        if (outputUnit === LibreCurrency.YEAR) {
            return timeStep / 12;
        }
        if (outputUnit === LibreCurrency.MONTH) {
            return timeStep * 12;
        }
        throw new Error("Time unit not managed");
    }
   
    getDividendStart(aGthStepUnit?: string, aPrdStepUnit?: string) {
        const gthStepUnit = aGthStepUnit || this.growthStepUnit;
        const prdStepUnit = aPrdStepUnit || this.getProdStepUnit();
       
        if (gthStepUnit === this.growthStepUnit && prdStepUnit === this.getProdStepUnit()) {
            return this.dividendStart;
        }
        let udStart = this.dividendStart;
        if (gthStepUnit !== this.growthStepUnit) {
            if (gthStepUnit === LibreCurrency.MONTH) {
                udStart = udStart * (Math.pow((1 + this.growth), 1/12) - 1) / this.growth;
            }
            else if (gthStepUnit === LibreCurrency.YEAR) {
                udStart = udStart * (Math.pow((1 + this.growth), 12) - 1) / this.growth;
            }
            else {
                throw new Error("Growth step unit not managed");
            }
        }
        if (this.growthStepUnit === LibreCurrency.YEAR && this.prodStepUnit === LibreCurrency.MONTH) {
            udStart = udStart * 12;
        }
        if (gthStepUnit === LibreCurrency.YEAR && prdStepUnit === LibreCurrency.MONTH) {
            udStart = udStart / 12;
        }
        return udStart;
    }
   
    /**
     * @returns true if account is deleted or false for first account
     */
    deleteAccount(accountIndex: number) {
        if (accountIndex === 0) {
            return false;
        }
        if (accountIndex > 0 && accountIndex < this.accounts.length) {
            const deletedAccount = this.accounts.splice(accountIndex, 1)[0];
            this.deleteTransactions(deletedAccount);
            return true;
        }
        throw new Error(accountIndex + "is an invalid account index");
    }
   
    getAccount(accountIndex: number) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex];
        }
        throw new Error(accountIndex + "is an invalid account index");
    }

    deleteTransactions(account: MAccount) {
        for (let i = this.transactions.length - 1; i >= 0; i--) {
            if (this.transactions[i].from === account || this.transactions[i].to === account) {
              this.transactions.splice(i, 1);
            }
        }
    }
   
    deleteTransaction(transactionIndex: number) {
        if (transactionIndex >= 0 && transactionIndex < this.transactions.length) {
            return this.transactions.splice(transactionIndex, 1);
        }
        throw new Error(transactionIndex + "is an invalid transaction index");
    }
   
    getTransaction(transactionIndex: number) {
        if (transactionIndex >= 0 && transactionIndex < this.transactions.length) {
            return this.transactions[transactionIndex];
        }
        throw new Error(transactionIndex + "is an invalid transaction index");
    }
    
    transactionIndex(transactionId: number) {
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].id === transactionId) {
                return i;
            }
        }
        return -1;
    }

    // eslint-disable-next-line max-lines-per-function
    generateData(aTimeStepBounds?: TimeStepBounds) {
        const timeStepBounds = aTimeStepBounds || {lower: this.getTimeLowerBound(), upper: this.getTimeUpperBound()};

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
           
        const moneyBirthStep = this.toTimeStep(this.moneyBirth, LibreCurrency.YEAR);
        
        for (let timeStep = 0; timeStep <= timeStepBounds.upper; timeStep++) {
           
            this.headcounts.values.push(this.getHeadcount(timeStep));
            this.dividends.values.push(this.getDividend(timeStep));
            this.monetarySupplies.values.push(this.getMonetarySupply(timeStep));
            for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
                this.accounts[iAccount].values.push(this.getAccountBalance(this.accounts[iAccount], timeStep));
            }
            this.applyTransactions(timeStep);
        }

        // **************
        // Set x,y arrays
        // **************
        
        for (let timeStep = timeStepBounds.lower; timeStep <= timeStepBounds.upper; timeStep++) {
           
            if (timeStep >= moneyBirthStep) {
                const du2 = this.applyPov(this.getDividend(timeStep), timeStep);
                if (!isNaN(du2)) {
                    this.dividends.x.push(timeStep);
                    this.dividends.y.push(du2);
                }
               
                const smn2 = this.applyPov((1 + this.getGrowth()) * this.getDividend(timeStep) / this.getGrowth() * this.prodFactor(), timeStep);
                if (!isNaN(smn2)) {
                    this.stableAverages.x.push(timeStep);
                    this.stableAverages.y.push(smn2);
                }
               
                const ms2 = this.applyPov(this.getMonetarySupply(timeStep), timeStep);
                if (!isNaN(ms2)) {
                    this.monetarySupplies.x.push(timeStep);
                    this.monetarySupplies.y.push(ms2);
                }
               
                const sms2 = this.applyPov(this.getHeadcount(timeStep) * (1 + this.getGrowth()) * this.getDividend(timeStep) / this.getGrowth() * this.prodFactor(), timeStep);
                if (!isNaN(sms2)) {
                    this.stableMonetarySupplies.x.push(timeStep);
                    this.stableMonetarySupplies.y.push(sms2);
                }
            }
           
            if (timeStep >= moneyBirthStep && this.headcounts.values[timeStep] > 0) {
                const mn2 = this.applyPov(this.getAverage(timeStep), timeStep);
                if (!isNaN(mn2)) {
                    this.averages.x.push(timeStep);
                    this.averages.y.push(mn2);
                }
               
                const sdu2 = this.applyPov(this.getGrowth() * this.getMonetarySupply(timeStep) / this.getHeadcount(timeStep) / (1 + this.getGrowth()) / this.prodFactor(), timeStep);
                if (!isNaN(sdu2)) {
                    this.stableDividends.x.push(timeStep);
                    this.stableDividends.y.push(sdu2);
                }
            }
           
            this.headcounts.x.push(timeStep);
            this.headcounts.y.push(this.headcounts.values[timeStep]);
           
            for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {

                const birthStep = this.toTimeStep(this.accounts[iAccount].birth, LibreCurrency.YEAR);
                // if account is born...
                if (timeStep >= birthStep) {
                    const a2 = this.applyPov(this.getAccountBalance(this.accounts[iAccount], timeStep), timeStep);
                    if (!isNaN(a2)) {
                        this.accounts[iAccount].x.push(timeStep);
                        this.accounts[iAccount].y.push(a2);
                    }
                }
            }
        }
        this.adaptYValues();
    }

    /**
     * Transform data to another reference frame
     *
     * @param value {int}   Source value
     * @returns {number|*}
     */
    applyPov(value: number, timeStep: number) {
        const referenceValue = LibreCurrency.referenceFrames[this.referenceFrameKey].transform(this, value, timeStep);
        if (LibreCurrency.referenceFrames[this.referenceFrameKey].logScale) {
            return Math.log(referenceValue) / Math.log(10);
        }
        return referenceValue;
    }
    
    /**
     * - since infinity value is not well managed by C3.js, replace it by a value easily recognizable and greater than all other values;
     * - round values to avoid noises (due to numerical instability) in constant series of values.
     */
    adaptYValues() {
        
        let maxAbs1 = LibreCurrency.maxAbs(this.dividends.y, 0);
        maxAbs1 = LibreCurrency.maxAbs(this.stableDividends.y, maxAbs1);
        
        LibreCurrency.adaptValues(this.dividends.y, maxAbs1);
        LibreCurrency.adaptValues(this.stableDividends.y, maxAbs1);
        
        let maxAbs2 = LibreCurrency.maxAbs(this.monetarySupplies.y, 0);
        maxAbs2 = LibreCurrency.maxAbs(this.stableMonetarySupplies.y, maxAbs2);
        
        LibreCurrency.adaptValues(this.monetarySupplies.y, maxAbs2);
        LibreCurrency.adaptValues(this.stableMonetarySupplies.y, maxAbs2);
        
        let maxAbs3 = LibreCurrency.maxAbs(this.averages.y, 0);
        maxAbs3 = LibreCurrency.maxAbs(this.stableAverages.y, maxAbs3);
        for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            maxAbs3 = LibreCurrency.maxAbs(this.accounts[iAccount].y, maxAbs3);
        }
        
        LibreCurrency.adaptValues(this.averages.y, maxAbs3);
        LibreCurrency.adaptValues(this.stableAverages.y, maxAbs3);
        for (let iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            LibreCurrency.adaptValues(this.accounts[iAccount].y, maxAbs3);
        }
    }
    
    static adaptValues(yArray: number[], maxAbs: number) {
        const substitute = Math.pow(10, Math.ceil(Math.log(maxAbs * 2) / Math.log(10))) * LibreCurrency.INFINITY_FACTOR;
        for (let i = 0; i < yArray.length; i++) {
            if (yArray[i] === Number.NEGATIVE_INFINITY) {
                // Replace NEGATIVE_INFINITY by a value easily recognizable and smaller than all other values
                yArray[i] = - substitute;
            }
            else if (yArray[i] === Number.POSITIVE_INFINITY) {
                // Replace POSITIVE_INFINITY by a value easily recognizable and greater than all other values
                yArray[i] = substitute;
            }
            else {
                // Round values to avoid noises (due to numerical instability) in constant series of values
                yArray[i] = Math.round(yArray[i]*100000)/100000;
            }
        }
    }
    
    static maxAbs(array: number[], defaultMax: number) {
        let maxAbs = defaultMax;
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== Number.NEGATIVE_INFINITY && array[i] !== Number.POSITIVE_INFINITY) {
                const curAbs = Math.abs(array[i]);
                if (curAbs > maxAbs) {
                    maxAbs = curAbs;
                }
            }
        }
        return maxAbs;
    }
    
    static isInfinite(value: number) {
        if (value === 0) {
            return 0;
        }
        const epsilon = 0.0001;
        const exp = Math.log(Math.abs(value) / LibreCurrency.INFINITY_FACTOR) / Math.log(10);
        if (Math.abs(exp - Math.round(exp)) < epsilon) {
            return value;
        }
        return 0;
    }
    
}

type MAccount = {
    id: number;
    birth: number;
    type: string;
    duration: number;
    startingPercentage: number;
    balance: number;
    values: number[];
    x: number[];
    y: number[];
};

type Transaction = {
    id: number;
    from: MAccount;
    to: MAccount;
    year: number;
    amount: number;
    amountRef: string;
    repetitionCount: number;
}

type DemographicProfile = {
    calculate: (money: LibreCurrency, year: number) => number;
}

type ReferenceFrame = {
    transform: (money: LibreCurrency, value: number, timeStep: number, amountRef?: number) => number;
    invTransform: (money: LibreCurrency, value: number, timeStep: number, amountRef?: number) => number;
    logScale: boolean;
}

type UdFormula = {
    calculate: (money: LibreCurrency, timeStep: number) => number;
}

type TimeStepBounds = {
    lower: number;
    upper: number;
}

type ModelAsJSon = {
    f : string; // udFormulaKey,
    r : string; // referenceFrameKey,
    rs : {
        mu: {
            log: boolean; // referenceFrames[MONETARY_UNIT_REF_KEY].logScale
        },
        ud: {
            log: boolean; // referenceFrames[DIVIDEND_REF_KEY].logScale
        },
        mn: {
            log: boolean; // referenceFrames[AVERAGE_REF_KEY].logScale
        }
    },
    le: number; // lifeExpectancy
    ud0: number; // dividendStart
    tm: number; // timeLowerBoundInYears
    tM: number; // timeUpperBoundInYears
    cc: boolean; // calculateGrowth
    cu: string; // growthStepUnit
    pu: string; // prodStepUnit
    c: number; // growth
    d: string; // demographicProfileKey
    dyM: number; // maxDemography
    dxm: number; // xMinDemography
    dxM: number; // xMaxDemography
    dxPv: number // xMpvDemography
    dp: number; // plateauDemography
    dxs: number; // xScaleDemography
    ac: number // accounts.length
    tc: number // transactions.length
};

type JsonAccountRep = {
    id: number; // id
    b: number; // birth
    d: number; // duration
    a0: number; // startingPercentage
    t: string; // type
};

type JsonTransactionRep = {
    id: number; // id,
    f: number; // from
    t: number; // to
    y: number; // year
    a: number; // amount
    r: string; // amountRef
    rc: number; // repetitionCount
};

type ValuesXY = {
    values : number[];
    x: number[];
    y: number[]
};

type XY = {
    x: number[];
    y: number[]
};
