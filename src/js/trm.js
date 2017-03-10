/**
 * Class of libre money chart generator
 *
 * Create instance context:
 *
 *      var myMoney = {};
 *
 * Create instance of class in context with constructor parameters
 *
 *      libre_money_class.call(myMoney, 80);
 *
 * Add a member account:
 *
 *      myMoney.add_account();
 *
 * Debug c3.js chart data
 *
 *      console.log(myMoney.generate_data());
 *
 * More infos:
 *
 * https://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
 *
 * @param life_expectancy {int} Members life expectancy
 * @param growthTimeUnit {String} Indicate the rythm of the dividend creation (YEAR or MONTH)
 * @param calculate_growth {boolean} Calculate growth from life expectancy
 * @param growth {double} Monetary supply growth in percent (per year or per month, it depends of 'growthTimeUnit')
 * @param dividend_start {int} First dividend amount (at first year or first month, it depends of 'growthTimeUnit')
 * @param displayedPeriodInYears {int} Money duration to generate
 * @param maxDemography {int} Order of magnitude of the maximum demography
 */
var libre_money_class = function(life_expectancy, growthTimeUnit, calculate_growth, growth, dividend_start, displayedPeriodInYears, maxDemography) {

    this.YEAR = 'YEAR';
    this.MONTH = 'MONTH';
   
    // Default Values
    var LIFE_EXPECTANCY = 80;
    var DIVIDEND_START = 1000;
    var DISPLAYED_PERIOD_IN_YEARS = 5;
    var CALCULATE_GROWTH = true;
    var PER_YEAR_GROWTH = 20;
    var PER_MONTH_GROWTH = 2;
    var GROWTH_TIME_UNIT = this.YEAR;
    var MAX_DEMOGRAPHY = 10000;
    this.DEFAULT_MONEY_BIRTH = 1;
    this.DEFAULT_STARTING_PERCENT = 0;
   
    this.moneyBirth = -1;
    this.life_expectancy = life_expectancy || LIFE_EXPECTANCY;
    this.dividend_start = dividend_start || DIVIDEND_START;
    this.displayedPeriodInYears = displayedPeriodInYears || DISPLAYED_PERIOD_IN_YEARS;

    this.calculate_growth = calculate_growth || CALCULATE_GROWTH;
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
    this.reference_frames = {
        'quantitative': {
            transform: function(money, value, timeStep) {
                return value;
            }
        },
        'relative': {
            transform: function(money, value, timeStep) {
                if (money.individualCount.values[timeStep] > 0) {
                    return value / money.dividends.values[timeStep];
                }
                else {
                    return 0;
                }
            }
        },
        'average': {
            transform: function(money, value, timeStep) {
                if (money.monetary_mass.values[timeStep] !== 0) {
                    return value / money.monetary_mass.values[timeStep] * money.individualCount.values[timeStep] * 100;
                }
                if (value === 0) {
                    return 0;
                }
                // We should return 'Infinity' but it's not well managed by c3
                return 100;
            }
        }
    };   
   
    // dididend formulae
    this.dividend_formulaes = {
        'UDA': {
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var current_people = money.individualCount.values[timeStep]
                if (current_people > 0) {
                    var current_monetary_mass = money.getMonetaryMass(timeStep);
                    return Math.max(previous_dividend, money.getGrowth() * (current_monetary_mass / current_people));
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDB': {
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var current_people = money.individualCount.values[timeStep]
                if (current_people > 0) {
                    return previous_dividend * (1 + money.getGrowth());
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDG': {
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var previous_people = money.individualCount.values[timeStep - 1]
                var current_people = money.individualCount.values[timeStep]
                if (previous_people > 0 && current_people > 0) {
                    var previous_monetary_mass = money.monetary_mass.values[timeStep - 1];
                    return previous_dividend + (Math.pow(money.getGrowth(), 2) * (previous_monetary_mass / previous_people));
                }
                else {
                    return previous_dividend;
                }
            }
        }
    };
   
    // population variation profiles
    this.population_profiles = {
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

    this.reference_frame = 'quantitative';
    this.formula_type = 'UDA';
    this.population_profile = 'None';

    this.reset_dividends = function () {
        this.dividends = {values : [], x: [], y: []};
    };

    this.reset_people = function () {
        this.individualCount = {values : [], x: []};
    };

    this.reset_monetary_mass = function () {
        this.monetary_mass = {values : [], x: [], y: []};
    };

    this.reset_average = function () {
        this.average = {values : [], x: [], y: []};
    };

    this.reset_accounts = function () {
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {
            this.accounts[i_account].balance = 0;
            this.accounts[i_account].values = [];
            this.accounts[i_account].x = [];
            this.accounts[i_account].y = [];
        }
    };

    this.resetMoneyBirth = function () {
        var moneyBirth = +Infinity;
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {
            moneyBirth = Math.min(moneyBirth, this.accounts[i_account].birth);
        }
        this.moneyBirth = moneyBirth;
    }
   
    this.calc_growth = function() {
        var growthPerYear = Math.pow(this.life_expectancy / 2, 2 / this.life_expectancy) - 1;
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

    this.getIndividualCount = function(timeStep) {
        if (timeStep < this.individualCount.values.length) {
            return this.individualCount.values[timeStep];
        }
        var people = 0;

        // for each account...
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {

            var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
            var deathStep = this.getTimeStep(this.accounts[i_account].birth + this.life_expectancy, this.YEAR);
            // if account is alive...
            if (timeStep >= birthStep && timeStep < deathStep) {
                // increment people count
                people++;
            }
        }
        people = people + this.population_profiles[this.population_profile].calculate(this.getTimeValue(timeStep, this.YEAR), this.maxDemography);

        return people;
    };

    this.getDividend = function(timeStep) {
        if (timeStep < this.dividends.values.length) {
            return this.dividends.values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var dividend = 0;
        if (timeStep === moneyBirthStep) {
            dividend = this.get_dividend_start();
        }
        else if (timeStep > moneyBirthStep) {
            // after first issuance, calculate next dividend depending on formula...
            dividend = this.dividend_formulaes[this.formula_type].calculate(this, timeStep);
        }
        return dividend;
    };
   
    this.getMonetaryMass = function(timeStep, removeStartingAmount) {
        if (timeStep < this.monetary_mass.values.length && !removeStartingAmount) {
            return this.monetary_mass.values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var monetary_mass = 0;
       
        if (timeStep >= moneyBirthStep) {
            var previousDividend = this.getDividend(timeStep - 1);
            var previousDemography = this.population_profiles[this.population_profile].calculate(this.getTimeValue(timeStep - 1, this.YEAR), this.maxDemography);
            monetary_mass = this.getMonetaryMass(timeStep - 1) + previousDemography * previousDividend;
        }

        for (var i_account = 0; i_account < this.accounts.length; i_account++) {
            monetary_mass += this.getAccountIncrease(i_account, timeStep, removeStartingAmount);
        }
       
        return monetary_mass;
    };
   
    this.getAccountBalance = function(i_account, timeStep) {
        if (timeStep < this.accounts[i_account].values.length) {
            return this.accounts[i_account].values[timeStep];
        }
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        var balance = 0;
       
        if (timeStep > 0) {
            balance = this.getAccountBalance(i_account, timeStep - 1);
        }
       
        balance += this.getAccountIncrease(i_account, timeStep);
       
        return balance;
    };
   
    this.getAccountIncrease = function(i_account, timeStep, removeStartingAmount) {
        var accountIncrease = 0;
        var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
        var deathStep = this.getTimeStep(this.accounts[i_account].birth + this.life_expectancy, this.YEAR);
        if (timeStep < deathStep && timeStep > birthStep && this.accounts[i_account].udProducer) {
            // add a dividend coming from each producer
            accountIncrease = this.getDividend(timeStep - 1);
        }
        var startingRatio = this.accounts[i_account].startingPercentage / 100;
        if (timeStep === birthStep && !removeStartingAmount && startingRatio != 0) {
            // at birth, add some money according to the 'startingPercentage' attribute
            var average = 0;
            var individualCount = this.getIndividualCount(timeStep);
            var previousIndividualCount = this.getIndividualCount(timeStep - 1);
            
            if (previousIndividualCount > 0 && individualCount / startingRatio > 1) {
                accountIncrease += this.getMonetaryMass(timeStep, true) / (individualCount / startingRatio - 1);
            }
            else {
                accountIncrease += startingRatio * this.getDividend(timeStep) / this.getGrowth();
            }
        }
       
        return accountIncrease;
    }
   
    this.getAverage = function(timeStep) {
        if (timeStep < this.average.values.length) {
            return this.average.values[timeStep];
        }
        var average = 0;
        var individualCount = this.getIndividualCount(timeStep);
       
        if (individualCount > 0) {
            average = this.getMonetaryMass(timeStep) / individualCount;
        }

        return average;
    };
   
    /**
     * add a member account with same attributes as the last account
     */
    this.add_account = function() {
        var id = 1;
        var birth = this.DEFAULT_MONEY_BIRTH;
        var startingPercentage = this.DEFAULT_STARTING_PERCENT;
        var udProducer = true;
        if (money.accounts.length > 0) {
            id = money.accounts[money.accounts.length - 1].id + 1;
            birth = money.accounts[money.accounts.length - 1].birth;
            startingPercentage = money.accounts[money.accounts.length - 1].startingPercentage;
            udProducer = money.accounts[money.accounts.length - 1].udProducer;
        }
        var name = "Member " + id;
       
        this.accounts.push({
            name: name,
            id: id,
            birth: birth,
            balance: 0,
            startingPercentage: startingPercentage,
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
       
    this.getDisplayedPeriod = function(timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
       
        if (timeUnit === this.MONTH) {
            return 12 * (this.displayedPeriodInYears - 1) + 1;
        }
        if (timeUnit === this.YEAR) {
            return this.displayedPeriodInYears;
        }
        throw new Error("Time unit not managed");
    }
   
    this.getTimeStep = function(timeValue, timeUnit) {
        if (timeUnit === this.growthTimeUnit) {
            return timeValue;
        }
        if (timeUnit === this.MONTH) {
            return (timeValue -1) / 12 + 1;
        }
        if (timeUnit === this.YEAR) {
            return (timeValue -1) * 12 + 1;
        }
        throw new Error("Time unit not managed");
    }
   
    this.getTimeValue = function(timeStep, timeUnit) {
        if (timeUnit === this.growthTimeUnit) {
            return timeStep;
        }
        if (timeUnit === this.YEAR) {
            return (timeStep -1) / 12 + 1;
        }
        if (timeUnit === this.MONTH) {
            return (timeValue -1) * 12 + 1;
        }
        throw new Error("Time unit not managed");
    }
   
    this.get_dividend_start = function(growthTimeUnit) {
        growthTimeUnit = growthTimeUnit || this.growthTimeUnit;
       
        if (growthTimeUnit === this.growthTimeUnit) {
            return this.dividend_start;
        }
        if (growthTimeUnit === this.MONTH) {
            return this.dividend_start * this.getGrowth(this.MONTH) / this.getGrowth(this.YEAR);
        }
        if (growthTimeUnit === this.YEAR) {
            return this.dividend_start * this.getGrowth(this.YEAR) / this.getGrowth(this.MONTH);
        }
        throw new Error("Growth time unit not managed");
    }
   
    /**
     * Return account deleted or false for first account
     *
     * @returns {*}|false
     */
    this.delete_account = function(accountIndex) {
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
   
    this.getUdProducer = function(accountIndex) {
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
            return this.accounts[accountIndex].startingPercentage;
        }
        throw new Error(accountIndex + "is an invalid account index");
    };

    this.setStartingPercentage = function(accountIndex, newStartingPercentage) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            this.accounts[accountIndex].startingPercentage = newStartingPercentage;
        }
        else {
            throw new Error(accountIndex + "is an invalid account index");
        }
    };
   
    this.generate_data = function () {

        if (this.calculate_growth) {
            this.calc_growth();
        }

        // **************
        // Reset data
        // **************
        
        this.reset_dividends();
        this.reset_people();
        this.reset_monetary_mass();
        this.reset_average();
        this.reset_accounts();
        this.resetMoneyBirth();

        // **************
        // Calculate data
        // **************
           
        var i_account, timeStep;
        var moneyBirthStep = this.getTimeStep(this.moneyBirth, this.YEAR);
        
        for (timeStep = 0; timeStep <= this.getDisplayedPeriod(); timeStep++) {
           
            this.individualCount.values.push(this.getIndividualCount(timeStep));
            this.dividends.values.push(this.getDividend(timeStep));
            this.monetary_mass.values.push(this.getMonetaryMass(timeStep));
            for (i_account = 0; i_account < this.accounts.length; i_account++) {
                this.accounts[i_account].values.push(this.getAccountBalance(i_account, timeStep));
            }
            this.average.values.push(this.getAverage(timeStep));
        }

        // **************
        // Set x,y arrays
        // **************
        
        for (timeStep = 0; timeStep <= this.getDisplayedPeriod(); timeStep++) {
           
            if (timeStep >= moneyBirthStep) {
                this.dividends.x.push(timeStep);
                this.dividends.y.push(this.applyPov(this.getDividend(timeStep), timeStep));
               
                this.monetary_mass.x.push(timeStep);
                this.monetary_mass.y.push(this.applyPov(this.getMonetaryMass(timeStep), timeStep));
            }
           
            if (this.individualCount.values[timeStep] > 0) {
                this.average.x.push(timeStep);
                this.average.y.push(this.applyPov(this.getAverage(timeStep), timeStep));
            }
           
            this.individualCount.x.push(timeStep);
           
            for (i_account = 0; i_account < this.accounts.length; i_account++) {

                var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
                // if account is born...
                if (timeStep >= birthStep) {
                    this.accounts[i_account].x.push(timeStep);
                    this.accounts[i_account].y.push(this.applyPov(this.getAccountBalance(i_account, timeStep), timeStep));
                }
            }
        }
    };

    /**
     * Transform data to another reference_frame
     *
     * @param value {int}   Source value
     * @returns {number|*}
     */
    this.applyPov = function (value, timeStep) {
        reference_frame_value = this.reference_frames[this.reference_frame].transform(this, value, timeStep);
        return Math.round (reference_frame_value * 100) / 100;
    }

};