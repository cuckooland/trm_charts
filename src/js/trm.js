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
 * @param lifeExpectancy {int} Members life expectancy
 * @param growthTimeUnit {String} Indicate the rythm of the dividend creation (YEAR or MONTH)
 * @param calculateGrowth {boolean} Calculate growth from life expectancy
 * @param growth {double} Monetary supply growth in percent (per year or per month, it depends of 'growthTimeUnit')
 * @param dividendStart {int} First dividend amount (at first year or first month, it depends of 'growthTimeUnit')
 * @param timeLowerBoundInYears {int} Time lower bound for plot generation
 * @param timeUpperBoundInYears {int} Time upper bound for plot generation
 * @param maxDemography {int} Order of magnitude of the maximum demography
 * @param widthDemography {int} Used to define a duration of the demography profile
 */
var libreMoneyClass = function(lifeExpectancy, growthTimeUnit, calculateGrowth, growth, dividendStart, timeLowerBoundInYears, timeUpperBoundInYears, maxDemography, xMinDemography, xMaxDemography, xMpvDemography, plateauDemography, xScaleDemography) {

    this.YEAR = 'YEAR';
    this.MONTH = 'MONTH';
   
    this.INFINITY_FACTOR = 1.234567;
    
    // Default Values
    const LIFE_EXPECTANCY = 80;
    const DIVIDEND_START = 1000;
    const TIME_LOWER_BOUND_IN_YEARS = 0;
    const TIME_UPPER_BOUND_IN_YEARS = 5;
    const CALCULATE_GROWTH = true;
    const PER_YEAR_GROWTH = 20;
    const PER_MONTH_GROWTH = 2;
    const GROWTH_TIME_UNIT = this.YEAR;
    const MAX_DEMOGRAPHY = 10000;
    const XMIN_DEMOGRAPHY = 0;
    const XMAX_DEMOGRAPHY = 80;
    const XMPV_DEMOGRAPHY = 40;
    const PLATEAU_DEMOGRAPHY = 78;
    const XSCALE_DEMOGRAPHY = 4;
    this.DEFAULT_MONEY_BIRTH = 1;
    this.DEFAULT_STARTING_PERCENT = 0;
   
    this.moneyBirth = -1;
    this.lifeExpectancy = lifeExpectancy || LIFE_EXPECTANCY;
    this.dividendStart = dividendStart || DIVIDEND_START;
    this.timeLowerBoundInYears = timeLowerBoundInYears || TIME_LOWER_BOUND_IN_YEARS;
    this.timeUpperBoundInYears = timeUpperBoundInYears || TIME_UPPER_BOUND_IN_YEARS;

    this.calculateGrowth = calculateGrowth || CALCULATE_GROWTH;
    this.growthTimeUnit = growthTimeUnit || GROWTH_TIME_UNIT;
    this.maxDemography = maxDemography || MAX_DEMOGRAPHY;
    this.xMinDemography = xMinDemography || XMIN_DEMOGRAPHY;
    this.xMaxDemography = xMaxDemography || XMAX_DEMOGRAPHY;
    this.xMpvDemography = xMpvDemography || XMPV_DEMOGRAPHY;
    this.plateauDemography = plateauDemography || PLATEAU_DEMOGRAPHY;
    this.xScaleDemography = xScaleDemography || XSCALE_DEMOGRAPHY;
   
    if (this.growthTimeUnit === this.MONTH) {
        this.growth = growth || PER_MONTH_GROWTH;
    }
    else if (this.growthTimeUnit === this.YEAR) {
        this.growth = growth || PER_YEAR_GROWTH;
    }
    else {
        throw new Error("Growth time unit not managed");
    }
   
    this.accounts = [];
    this.referenceFrames = {
        'monetaryUnit': {
            transform: function(money, value, timeStep) {
                return value;
            },
            logScale: false
        },
        'dividend': {
            transform: function(money, value, timeStep) {
                if (value === 0) {
                    return 0;
                }
                return value / money.dividends.values[timeStep];
            },
            logScale: false
        },
        'average': {
            transform: function(money, value, timeStep) {
                if (value === 0) {
                    return 0;
                }
                if (money.monetarySupplies.values[timeStep] === 0) {
                    return Infinity;
                }
                return value / money.monetarySupplies.values[timeStep] * money.headcounts.values[timeStep] * 100;
            },
            logScale: false
        }
    };   
   
    // dididend formulas
    this.udFormulas = {
        'BasicUD': {
            // BasicUD(t+dt) = c*M(t)/N(t+dt)
            calculate: function (money, timeStep) {
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var previousMonetarySupply = money.getMonetarySupply(timeStep - 1);
                    return money.getGrowth() * (previousMonetarySupply / currentHeadcount);
                } else {
                    var previousDividend = money.dividends.values[timeStep - 1];
                    return previousDividend;
                }
            }
        },
        'UDA': {
            // UDA(t+dt) = Max[UDA(t) ; c*M(t)/N(t+dt)]
            calculate: function (money, timeStep) {
                var previousDividend = money.dividends.values[timeStep - 1];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var previousMonetarySupply = money.getMonetarySupply(timeStep - 1);
                    return Math.max(previousDividend, money.getGrowth() * (previousMonetarySupply / currentHeadcount));
                } else {
                    return previousDividend;
                }
            }
        },
        'UDB': {
            // UDB(t+dt) = (1+c)*UDB(t)
            calculate: function (money, timeStep) {
                var previousDividend = money.dividends.values[timeStep - 1];
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
                var previousDividend = money.dividends.values[timeStep - 1];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var previousMonetarySupply = money.getMonetarySupply(timeStep - 1);
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
                var previousDividend = money.dividends.values[timeStep - 1];
                var previousHeadcount = money.headcounts.values[timeStep - 1]
                var currentHeadcount = money.headcounts.values[timeStep]
                if (previousHeadcount > 0 && currentHeadcount > 0) {
                    var previous2MonetarySupply = money.monetarySupplies.values[timeStep - 2];
                    return previousDividend + (Math.pow(money.getGrowth(), 2) * (previous2MonetarySupply / previousHeadcount));
                }
                else {
                    return previousDividend;
                }
            }
        }
    };
   
    // population variation profiles
    this.demographicProfiles = {
        'None': {
            calculate: function (money, timeStep) {
                return 0;
            }
        },
        'Triangular': {
            calculate: function (money, timeStep) {
                if (timeStep <= money.xMinDemography) {
                    return 0;
                }
                if (timeStep >= money.xMaxDemography) {
                    return 0;
                }
                if (timeStep <= money.xMpvDemography) {
                    return Math.trunc(money.maxDemography * (timeStep - money.xMinDemography) / (money.xMpvDemography - money.xMinDemography));
                }
                if (timeStep >= money.xMpvDemography) {
                    return Math.trunc(money.maxDemography * (money.xMaxDemography - timeStep) / (money.xMaxDemography - money.xMpvDemography));
                }
                return 0;
            }
        },
        'Plateau': {
            calculate: function (money, timeStep) {
                var slopeDuration = ((money.xMaxDemography - money.xMinDemography) - money.plateauDemography) / 2;
                var xMean1 = money.xMinDemography + slopeDuration;
                var xMean2 = money.xMaxDemography - slopeDuration;
                if (timeStep <= money.xMinDemography) {
                    return 0;
                }
                if (timeStep >= money.xMaxDemography) {
                    return 0;
                }
                if (timeStep <= xMean1) {
                    return Math.trunc(money.maxDemography * (timeStep - money.xMinDemography) / (xMean1 - money.xMinDemography));
                }
                if (timeStep >= xMean2) {
                    return Math.trunc(money.maxDemography * (money.xMaxDemography - timeStep) / (money.xMaxDemography - xMean2));
                }
                return money.maxDemography;
            }
        },
        'Cauchy': {
            calculate: function (money, timeStep) {
                var tmp = (timeStep - money.xMpvDemography) / money.xScaleDemography;
                return Math.trunc(money.maxDemography / (1 + tmp * tmp));
            }
        },
        'DampedWave': {
            calculate: function (money, timeStep) {
                var x = timeStep / (2 * money.xScaleDemography);
               
                return Math.trunc(money.maxDemography * (1 - Math.cos(2*x) / (1 + x * x)));
            }
        }
    };

    this.referenceFrameKey = Object.keys(this.referenceFrames)[0];
    this.udFormulaKey = Object.keys(this.udFormulas)[0];
    this.demographicProfileKey = Object.keys(this.demographicProfiles)[0];

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
        var people = 0;

        // for each account...
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {

            var birthStep = this.getTimeStep(this.accounts[iAccount].birth, this.YEAR);
            var deathStep = this.getTimeStep(this.accounts[iAccount].birth + this.lifeExpectancy, this.YEAR);
            // if account is alive...
            if (timeStep >= birthStep && timeStep < deathStep) {
                // increment people count
                people++;
            }
        }
        people = people + this.demographicProfiles[this.demographicProfileKey].calculate(this, this.getTimeValue(timeStep, this.YEAR));

        return people;
    };

    this.asJSonRep = function() {
        var jsonRep = {
            'udFormulaKey' : this.udFormulaKey,
            'referenceFrameKey' : this.referenceFrameKey,
            'referenceFrames' : {
                'monetaryUnit': {
                    'logScale': this.referenceFrames['monetaryUnit'].logScale
                },
                'dividend': {
                    'logScale': this.referenceFrames['dividend'].logScale
                },
                'average': {
                    'logScale': this.referenceFrames['average'].logScale
                }
            },
            'lifeExpectancy' : this.lifeExpectancy,
            'dividendStart' : this.dividendStart,
            'timeLowerBoundInYears' : this.timeLowerBoundInYears,
            'timeUpperBoundInYears' : this.timeUpperBoundInYears,
            'calculateGrowth' : this.calculateGrowth,
            'growthTimeUnit' : this.growthTimeUnit,
            'growth' : this.growth,
            'demographicProfileKey' : this.demographicProfileKey,
            'maxDemography' : this.maxDemography,
            'xMinDemography' : this.xMinDemography,
            'xMaxDemography' : this.xMaxDemography,
            'xMpvDemography' : this.xMpvDemography,
            'plateauDemography' : this.plateauDemography,
            'xScaleDemography' : this.xScaleDemography,
            'accountCount' : this.accounts.length
        };
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            jsonRep['account' + iAccount] = {
                id: this.accounts[iAccount].id,
                birth: this.accounts[iAccount].birth,
                StartingPercentage: this.accounts[iAccount].StartingPercentage,
                udProducer: this.accounts[iAccount].udProducer,
            }
        }
        return jsonRep;
    }
    
    this.applyJSonRep = function(jsonRep) {
        this.lifeExpectancy = jsonRep.lifeExpectancy;
        this.udFormulaKey = jsonRep.udFormulaKey;
        this.referenceFrameKey = jsonRep.referenceFrameKey;
        this.referenceFrames['monetaryUnit'].logScale = jsonRep.referenceFrames.monetaryUnit.logScale;
        this.referenceFrames['dividend'].logScale = jsonRep.referenceFrames.dividend.logScale;
        this.referenceFrames['average'].logScale = jsonRep.referenceFrames.average.logScale;
        this.dividendStart = jsonRep.dividendStart;
        this.timeLowerBoundInYears = jsonRep.timeLowerBoundInYears;
        this.timeUpperBoundInYears = jsonRep.timeUpperBoundInYears;
        this.calculateGrowth = jsonRep.calculateGrowth;
        this.growthTimeUnit = jsonRep.growthTimeUnit;
        this.growth = jsonRep.growth;
        this.demographicProfileKey = jsonRep.demographicProfileKey;
        this.maxDemography = jsonRep.maxDemography;
        this.xMinDemography = jsonRep.xMinDemography;
        this.xMaxDemography = jsonRep.xMaxDemography;
        this.xMpvDemography = jsonRep.xMpvDemography;
        this.plateauDemography = jsonRep.plateauDemography;
        this.xScaleDemography = jsonRep.xScaleDemography;
        
        this.accounts = [];
        var accountCount = jsonRep.accountCount;
        for (var iAccount = 0; iAccount < accountCount; iAccount++) {
            var accountDescr = jsonRep['account' + iAccount];
            this.accounts.push({
                id: accountDescr.id,
                birth: accountDescr.birth,
                balance: 0,
                StartingPercentage: accountDescr.StartingPercentage,
                udProducer: accountDescr.udProducer,
                values: [],
                x: [],
                y: [],
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
            monetarySupply = this.getMonetarySupply(timeStep - 1) + currentDemography * currentDividend;
        }

        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            monetarySupply += this.getAccountIncrease(iAccount, timeStep);
        }
       
        return monetarySupply;
    };
   
    this.getAccountBalance = function(iAccount, timeStep) {
        if (timeStep < this.accounts[iAccount].values.length) {
            return this.accounts[iAccount].values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var balance = 0;
       
        if (timeStep > 0) {
            balance = this.getAccountBalance(iAccount, timeStep - 1);
        }
       
        balance += this.getAccountIncrease(iAccount, timeStep);
       
        return balance;
    };
   
    this.getAccountIncrease = function(iAccount, timeStep) {
        var accountIncrease = 0;
        var birthStep = this.getTimeStep(this.accounts[iAccount].birth, this.YEAR);
        var deathStep = this.getTimeStep(this.accounts[iAccount].birth + this.lifeExpectancy, this.YEAR);
        if (timeStep < deathStep && timeStep >= birthStep && this.accounts[iAccount].udProducer) {
            // Add a dividend coming from producer
            accountIncrease = this.getDividend(timeStep);
        }

        var startingRatio = this.accounts[iAccount].StartingPercentage / 100;
        if (startingRatio != 0) {
            // At birth, add some money according to the 'StartingPercentage' attribute
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
        var StartingPercentage = this.DEFAULT_STARTING_PERCENT;
        var udProducer = true;
        if (this.accounts.length > 0) {
            id = this.accounts[this.accounts.length - 1].id + 1;
            birth = this.accounts[this.accounts.length - 1].birth;
            StartingPercentage = this.accounts[this.accounts.length - 1].StartingPercentage;
            udProducer = this.accounts[this.accounts.length - 1].udProducer;
        }
       
        this.accounts.push({
            id: id,
            birth: birth,
            balance: 0,
            StartingPercentage: StartingPercentage,
            udProducer: udProducer,
            values: [],
            x: [],
            y: [],
        });
    };

    this.searchAccount = function(accountId) {
        for (var i = 0; i < this.accounts.length; i++) {
            if (this.accounts[i].id == accountId) {
                return this.accounts[i];
            }
        };
        return null;
    }
    
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
        throw new Error("Time unit not managed");
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
        throw new Error("Time unit not managed");
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
            return timeValue * 12;
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
            return this.accounts.splice(accountIndex, 1);
        }
        throw new Error(accountIndex + "is an invalid account index");
    };
   
    this.getAccountBirth = function(accountIndex) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex].birth;
        }
        throw new Error(accountIndex + "is an invalid account index");
    };

    this.setAccountBirth = function(accountIndex, birth) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            this.accounts[accountIndex].birth = birth;
        }
        else {
            throw new Error(accountIndex + "is an invalid account index");
        }
    };
   
    this.isUdProducer = function(accountIndex) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex].udProducer;
        }
        throw new Error(accountIndex + "is an invalid account index");
    };

    this.setUdProducer = function(accountIndex, newUdProducer) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            this.accounts[accountIndex].udProducer = newUdProducer;
        }
        else {
            throw new Error(accountIndex + "is an invalid account index");
        }
    };
   
    this.getStartingPercentage = function(accountIndex) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex].StartingPercentage;
        }
        throw new Error(accountIndex + "is an invalid account index");
    };

    this.setStartingPercentage = function(accountIndex, newStartingPercentage) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            this.accounts[accountIndex].StartingPercentage = newStartingPercentage;
        }
        else {
            throw new Error(accountIndex + "is an invalid account index");
        }
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
                this.accounts[iAccount].values.push(this.getAccountBalance(iAccount, timeStep));
            }
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
                    this.accounts[iAccount].y.push(this.applyPov(this.getAccountBalance(iAccount, timeStep), timeStep));
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