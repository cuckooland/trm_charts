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
 */
var libreMoneyClass = function(lifeExpectancy, growthTimeUnit, calculateGrowth, growth, dividendStart, timeLowerBoundInYears, timeUpperBoundInYears, maxDemography) {

    this.YEAR = 'YEAR';
    this.MONTH = 'MONTH';
   
    this.INFINITY_FACTOR = 1.234567;
    
    // Default Values
    var LIFE_EXPECTANCY = 80;
    var DIVIDEND_START = 1000;
    var TIME_LOWER_BOUND_IN_YEARS = 0;
    var TIME_UPPER_BOUND_IN_YEARS = 5;
    var CALCULATE_GROWTH = true;
    var PER_YEAR_GROWTH = 20;
    var PER_MONTH_GROWTH = 2;
    var GROWTH_TIME_UNIT = this.YEAR;
    var MAX_DEMOGRAPHY = 10000;
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
            }
        },
        'monetaryUnitLog': {
            transform: function(money, value, timeStep) {
                return Math.log(value) / Math.log(10);
            }
        },
        'dividend': {
            transform: function(money, value, timeStep) {
                if (value === 0) {
                    return 0;
                }
                return value / money.dividends.values[timeStep];
            }
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
            }
        }
    };   
   
    // dididend formulae
    this.udFormulas = {
        'BasicUD': {
            calculate: function (money, timeStep) {
                var previousDividend = money.dividends.values[timeStep - 1];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var currentMonetarySupply = money.getMonetarySupply(timeStep);
                    return money.getGrowth() * (currentMonetarySupply / currentHeadcount);
                } else {
                    return previousDividend;
                }
            }
        },
        'UDA': {
            calculate: function (money, timeStep) {
                var previousDividend = money.dividends.values[timeStep - 1];
                var currentHeadcount = money.headcounts.values[timeStep]
                if (currentHeadcount > 0) {
                    var currentMonetarySupply = money.getMonetarySupply(timeStep);
                    return Math.max(previousDividend, money.getGrowth() * (currentMonetarySupply / currentHeadcount));
                } else {
                    return previousDividend;
                }
            }
        },
        'UDB': {
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
        'UDG': {
            calculate: function (money, timeStep) {
                var previousDividend = money.dividends.values[timeStep - 1];
                var previousHeadcount = money.headcounts.values[timeStep - 1]
                var currentHeadcount = money.headcounts.values[timeStep]
                if (previousHeadcount > 0 && currentHeadcount > 0) {
                    var previousMonetarySupply = money.monetarySupplies.values[timeStep - 1];
                    return previousDividend + (Math.pow(money.getGrowth(), 2) * (previousMonetarySupply / previousHeadcount));
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
            calculate: function (timeStep) {
                return 0;
            }
        },
        'Uniform': {
            calculate: function (timeStep, yMax, xMin, xMax) {
                xMin = xMin || 0;
                xMax = xMax || 81;
                yMax = yMax || 10000;
               
                if (timeStep <= xMin) {
                    return 0;
                }
                if (timeStep >= xMax) {
                    return 0;
                }
                return yMax;
            }
        },
        'Triangular': {
            calculate: function (timeStep, yMax, xMin, xMax) {
                xMin = xMin || 0;
                xMax = xMax || 81;
                yMax = yMax || 10000;
               
                var xMean = (xMax - xMin) / 2;
                if (timeStep <= xMin) {
                    return 0;
                }
                if (timeStep >= xMax) {
                    return 0;
                }
                if (timeStep <= xMean) {
                    return Math.trunc(yMax * (timeStep - xMin) / (xMean - xMin));
                }
                if (timeStep >= xMean) {
                    return Math.trunc(yMax * (xMax - timeStep) / (xMax - xMean));
                }
                return 0;
            }
        },
        'Plateau': {
            calculate: function (timeStep, yMax, xMin, xMax, duration) {
                xMin = xMin || 0;
                xMax = xMax || 81;
                duration = duration || 60;
                yMax = yMax || 10000;
               
                var slopeDuration = ((xMax - xMin) - duration) / 2;
                var xMean1 = xMin + slopeDuration;
                var xMean2 = xMax - slopeDuration;
                if (timeStep <= xMin) {
                    return 0;
                }
                if (timeStep >= xMax) {
                    return 0;
                }
                if (timeStep <= xMean1) {
                    return Math.trunc(yMax * (timeStep - xMin) / (xMean1 - xMin));
                }
                if (timeStep >= xMean2) {
                    return Math.trunc(yMax * (xMax - timeStep) / (xMax - xMean2));
                }
                return yMax;
            }
        },
        'Cauchy': {
            calculate: function (timeStep, yMax, a, xMin, xMax) {
                a = a || 2;
                xMin = xMin || 0;
                xMax = xMax || 80;
                yMax = yMax || 10000;
               
                var xMean = (xMax - xMin) / 2;
                var tmp = (timeStep - xMean) / a;
                return Math.trunc(yMax / (1 + tmp * tmp));
            }
        },
        'DampedWave': {
            calculate: function (timeStep, yMax) {
                yMax = yMax || 10000;
                var x = timeStep / 4;
               
                return Math.trunc(yMax * (1 - Math.cos(2*x) / (1 + x * x)));
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
        people = people + this.demographicProfiles[this.demographicProfileKey].calculate(this.getTimeValue(timeStep, this.YEAR), this.maxDemography);

        return people;
    };

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
            // after first issuance, calculate next dividend depending on formula...
            dividend = this.udFormulas[this.udFormulaKey].calculate(this, timeStep);
        }
        return dividend;
    };
   
    this.getMonetarySupply = function(timeStep, removeStartingAmount) {
        if (timeStep < this.monetarySupplies.values.length && !removeStartingAmount) {
            return this.monetarySupplies.values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var monetarySupply = 0;
       
        if (timeStep >= moneyBirthStep) {
            var previousDividend = this.getDividend(timeStep - 1);
            var previousDemography = this.demographicProfiles[this.demographicProfileKey].calculate(this.getTimeValue(timeStep - 1, this.YEAR), this.maxDemography);
            monetarySupply = this.getMonetarySupply(timeStep - 1) + previousDemography * previousDividend;
        }

        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            monetarySupply += this.getAccountIncrease(iAccount, timeStep, removeStartingAmount);
        }
       
        return monetarySupply;
    };
   
    this.getCruisingMonetarySupply = function(timeStep) {
        if (timeStep < this.cruisingMonetarySupplies.values.length) {
            return this.cruisingMonetarySupplies.values[timeStep];
        }
        
        return this.getHeadcount(timeStep) * this.getDividend(timeStep) / this.getGrowth();
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
   
    this.getAccountIncrease = function(iAccount, timeStep, removeStartingAmount) {
        var accountIncrease = 0;
        var birthStep = this.getTimeStep(this.accounts[iAccount].birth, this.YEAR);
        var deathStep = this.getTimeStep(this.accounts[iAccount].birth + this.lifeExpectancy, this.YEAR);
        if (timeStep < deathStep && timeStep > birthStep && this.accounts[iAccount].udProducer) {
            // add a dividend coming from each producer
            accountIncrease = this.getDividend(timeStep - 1);
        }
        var startingRatio = this.accounts[iAccount].StartingPercentage / 100;
        if (timeStep === birthStep && !removeStartingAmount && startingRatio != 0) {
            // at birth, add some money according to the 'StartingPercentage' attribute
            var average = 0;
            var headcount = this.getHeadcount(timeStep);
            var previousHeadcount = this.getHeadcount(timeStep - 1);
            
            if (previousHeadcount > 0 && headcount / startingRatio > 1) {
                accountIncrease += this.getMonetarySupply(timeStep, true) / (headcount / startingRatio - 1);
            }
            else {
                accountIncrease += startingRatio * this.getDividend(timeStep) / this.getGrowth();
            }
        }
       
        return accountIncrease;
    }
   
    this.getAverage = function(timeStep) {
        if (timeStep < this.averages.values.length) {
            return this.averages.values[timeStep];
        }
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
        if (money.accounts.length > 0) {
            id = money.accounts[money.accounts.length - 1].id + 1;
            birth = money.accounts[money.accounts.length - 1].birth;
            StartingPercentage = money.accounts[money.accounts.length - 1].StartingPercentage;
            udProducer = money.accounts[money.accounts.length - 1].udProducer;
        }
        var name = "Member " + id;
       
        this.accounts.push({
            name: name,
            id: id,
            birth: birth,
            balance: 0,
            StartingPercentage: StartingPercentage,
            udProducer: udProducer,
            values: [],
            x: [],
            y: [],
        });
        return this.accounts.length - 1;
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
   
    this.getAccountName = function(accountIndex) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex].name;
        }
        throw new Error(accountIndex + "is an invalid account index");
    };

    this.setAccountName = function(accountIndex, name) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            this.accounts[accountIndex].name = name;
        }
        else {
            throw new Error(accountIndex + "is an invalid account index");
        }
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
        this.scaledAverages = {values : [], x: [], y: []};
        this.headcounts = {values : [], x: [], y: []};
        this.monetarySupplies = {values : [], x: [], y: []};
        this.cruisingMonetarySupplies = {values : [], x: [], y: []};
        this.averages = {values : [], x: [], y: []};
        this.scaledDividends = {values : [], x: [], y: []};
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
            this.cruisingMonetarySupplies.values.push(this.getCruisingMonetarySupply(timeStep));
            for (iAccount = 0; iAccount < this.accounts.length; iAccount++) {
                this.accounts[iAccount].values.push(this.getAccountBalance(iAccount, timeStep));
            }
            this.averages.values.push(this.getAverage(timeStep));
        }

        // **************
        // Set x,y arrays
        // **************
        
        for (timeStep = this.getTimeLowerBound(); timeStep <= this.getTimeUpperBound(); timeStep++) {
           
            if (timeStep >= moneyBirthStep) {
                this.dividends.x.push(timeStep);
                this.dividends.y.push(this.applyPov(this.getDividend(timeStep), timeStep));
               
                this.scaledDividends.x.push(timeStep);
                this.scaledDividends.y.push(this.applyPov(this.getDividend(timeStep) / this.getGrowth(), timeStep));
               
                this.monetarySupplies.x.push(timeStep);
                this.monetarySupplies.y.push(this.applyPov(this.getMonetarySupply(timeStep), timeStep));
               
                this.cruisingMonetarySupplies.x.push(timeStep);
                this.cruisingMonetarySupplies.y.push(this.applyPov(this.getCruisingMonetarySupply(timeStep), timeStep));
            }
           
            if (this.headcounts.values[timeStep] > 0) {
                this.averages.x.push(timeStep);
                this.averages.y.push(this.applyPov(this.getAverage(timeStep), timeStep));
               
                this.scaledAverages.x.push(timeStep);
                this.scaledAverages.y.push(this.applyPov(this.getAverage(timeStep) * this.getGrowth(), timeStep));
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
        this.replaceYInfinity();
    };

    /**
     * Transform data to another reference frame
     *
     * @param value {int}   Source value
     * @returns {number|*}
     */
    this.applyPov = function (value, timeStep) {
        var referenceValue = this.referenceFrames[this.referenceFrameKey].transform(this, value, timeStep);
        return referenceValue;
    }
    
    this.replaceYInfinity = function () {
        
        var maxAbs1 = this.maxAbs(this.dividends.y, 0);
        maxAbs1 = this.maxAbs(this.scaledAverages.y, maxAbs1);
        
        this.replaceInfinity(this.dividends.y, maxAbs1);
        this.replaceInfinity(this.scaledAverages.y, maxAbs1);
        
        var maxAbs2 = this.maxAbs(this.monetarySupplies.y, 0);
        maxAbs2 = this.maxAbs(this.cruisingMonetarySupplies.y, maxAbs2);
        
        this.replaceInfinity(this.monetarySupplies.y, maxAbs2);
        this.replaceInfinity(this.cruisingMonetarySupplies.y, maxAbs2);
        
        var maxAbs3 = this.maxAbs(this.averages.y, 0);
        maxAbs3 = this.maxAbs(this.scaledDividends.y, maxAbs3);
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            maxAbs3 = this.maxAbs(this.accounts[iAccount].y, maxAbs3);
        }
        
        this.replaceInfinity(this.averages.y, maxAbs3);
        this.replaceInfinity(this.scaledDividends.y, maxAbs3);
        for (var iAccount = 0; iAccount < this.accounts.length; iAccount++) {
            this.replaceInfinity(this.accounts[iAccount].y, maxAbs3);
        }
    }
    
    this.replaceInfinity = function (yArray, maxAbs) {
        var substitute = Math.pow(10, Math.ceil(Math.log(maxAbs * 2) / Math.log(10))) * this.INFINITY_FACTOR;
        for (i = 0; i < yArray.length; i++) {
            if (yArray[i] == Number.NEGATIVE_INFINITY) {
                yArray[i] = - substitute;
            }
            
            if (yArray[i] == Number.POSITIVE_INFINITY) {
                yArray[i] = substitute;
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