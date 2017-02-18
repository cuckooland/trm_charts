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
    this.MONEY_BIRTH = 1;
    
    // Default Values
    var LIFE_EXPECTANCY = 80;
    var DIVIDEND_START = 1000;
    var DISPLAYED_PERIOD_IN_YEARS = 5;
    var CALCULATE_GROWTH = true;
    var PER_YEAR_GROWTH = 20;
    var PER_MONTH_GROWTH = 2;
    var GROWTH_TIME_UNIT = this.YEAR;
    var MAX_DEMOGRAPHY = 10000;
    
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
                if (money.udProducerCount.values[timeStep] > 0) {
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
                    return value / money.monetary_mass.values[timeStep] * money.udProducerCount.values[timeStep] * 100;
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
                var current_people = money.udProducerCount.values[timeStep]
                if (current_people > 0) {
                    var current_monetary_mass = money.monetary_mass.values[timeStep];
                    return Math.max(previous_dividend, money.getGrowth() * (current_monetary_mass / current_people));
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDB': {
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var current_people = money.udProducerCount.values[timeStep]
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
                var previous_people = money.udProducerCount.values[timeStep - 1]
                var current_people = money.udProducerCount.values[timeStep]
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
        this.udProducerCount = {values : [], x: []};
    };

    this.reset_monetary_mass = function () {
        this.monetary_mass = {values : [], x: [], y: []};
    };

    this.reset_average = function () {
        this.average = {values : [], x: [], y: []};
    };

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

    this.getUdProducerCount = function(timeStep) {
        var people = 0;

        // for each account...
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {

            var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
            var deathStep = this.getTimeStep(this.accounts[i_account].birth + this.life_expectancy, this.YEAR);
            // if account is alive...
            if (timeStep >= birthStep && timeStep < deathStep && this.accounts[i_account].udProducer) {
                // increment people count
                people++;
            }
        }
        people = people + this.population_profiles[this.population_profile].calculate(this.getTimeValue(timeStep, this.YEAR), this.maxDemography);

        return people;
    };

    /**
     * add a member account with same attributes as the last account
     */
	this.add_account = function() {
        var id = 1;
        var birth = this.MONEY_BIRTH;
        var startingAccount = 1;
        var udProducer = true;
        if (money.accounts.length > 0) {
            id = money.accounts[money.accounts.length - 1].id + 1;
            birth = money.accounts[money.accounts.length - 1].birth;
            startingAccount = money.accounts[money.accounts.length - 1].startingAccount;
            udProducer = money.accounts[money.accounts.length - 1].udProducer;
        }
        var name = "Member " + id;
        
		this.accounts.push({
            name: name,
            id: id,
            birth: birth,
            balance: 0,
            startingAccount: startingAccount,
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
	
    this.getStartingAccount = function(accountIndex) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            return this.accounts[accountIndex].startingAccount;
        }
        throw new Error(accountIndex + "is an invalid account index");
	};

    this.setStartingAccount = function(accountIndex, newStartingAccount) {
        if (accountIndex >= 0 && accountIndex < this.accounts.length) {
            this.accounts[accountIndex].startingAccount = newStartingAccount;
        }
        else {
            throw new Error(accountIndex + "is an invalid account index");
        }
	};
	
    this.generate_data = function () {

        // init data
        this.reset_dividends();
        this.reset_people();
        this.reset_monetary_mass();
        this.reset_average();

        if (this.calculate_growth) {
            console.log("calculate growth");
            // calculate growth
            this.calc_growth();
        }
        console.log("growth", this.growth);

        var i_account, timeStep;
        // For each account...
		for (i_account = 0; i_account < this.accounts.length; i_account++) {
            // reset data
            this.accounts[i_account].balance = 0;
            this.accounts[i_account].values = [];
            this.accounts[i_account].x = [];
            this.accounts[i_account].y = [];
		}

        var monetary_mass = 0;
        var average = 0;
        
		for (timeStep = 0; timeStep <= this.getDisplayedPeriod(); timeStep++) {
            this.udProducerCount.values.push(this.getUdProducerCount(timeStep));
		}
        
        var moneyBirthStep = this.getTimeStep(this.MONEY_BIRTH, this.YEAR);
        // for each time of the people existence...
	    for (timeStep = 0; timeStep <= this.getDisplayedPeriod(); timeStep++) {
		    
                if (timeStep > moneyBirthStep) {
                    // add a dividend coming from each producer
                    monetary_mass += this.udProducerCount.values[timeStep - 1] * this.dividends.values[timeStep - 1];
                }
                
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
                    var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
                    if (timeStep === birthStep) {
                        // at birth, add some money according to the 'startingAccount' attribute  
                        if (timeStep === moneyBirthStep) {
                            monetary_mass += this.accounts[i_account].startingAccount * this.get_dividend_start() / this.getGrowth();
                        }
                        else {
                            monetary_mass += this.accounts[i_account].startingAccount * this.dividends.values[timeStep - 1] / this.getGrowth();
                        }
                    }
                }
    
                // add monetary_mass
                this.monetary_mass.values.push(monetary_mass);
    
                // calculate next dividend...
                var dividend = 0;
                if (timeStep === moneyBirthStep) {
                    dividend = this.get_dividend_start();
                }
                else if (timeStep > moneyBirthStep) {
                    // after first issuance, calculate next dividend depending on formula...
                    dividend = this.dividend_formulaes[this.formula_type].calculate(this, timeStep);
                }
                
                this.dividends.values.push(dividend);
    
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
    
                    var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
                    var deathStep = this.getTimeStep(this.accounts[i_account].birth + this.life_expectancy, this.YEAR);
                    
                    if (timeStep < deathStep) {
                        if (timeStep === birthStep) {
                            // at birth, add some money according to the 'startingAccount' 
                            this.accounts[i_account].balance += this.accounts[i_account].startingAccount * dividend / this.getGrowth();
                        }
                        else if (timeStep > birthStep) {
                            // add a dividend to the account balance according to the 'udProducer' attribute  
                    	    if (this.accounts[i_account].udProducer) {
                                this.accounts[i_account].balance += this.dividends.values[timeStep - 1];
                            }
                        }
                    }
                    // add y value
                    this.accounts[i_account].values.push(this.accounts[i_account].balance);
                }
                
                // add average
                average = monetary_mass / this.udProducerCount.values[timeStep];
                this.average.values.push(average);
    
                if (timeStep >= moneyBirthStep) {
                    this.dividends.x.push(timeStep);
                    this.dividends.y.push(this.get_reference_frame_value(dividend, timeStep));
                    
                    this.monetary_mass.x.push(timeStep);
                    this.monetary_mass.y.push(this.get_reference_frame_value(monetary_mass, timeStep));
                }
                
                if (this.udProducerCount.values[timeStep] > 0) {
                    this.average.x.push(timeStep);
                    this.average.y.push(this.get_reference_frame_value(average, timeStep));
                }
                
                this.udProducerCount.x.push(timeStep);
                
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
    
                    var birthStep = this.getTimeStep(this.accounts[i_account].birth, this.YEAR);
                    // if account is born...
                    if (timeStep >= birthStep) {
                        this.accounts[i_account].x.push(timeStep);
                        this.accounts[i_account].y.push(this.get_reference_frame_value(this.accounts[i_account].balance, timeStep));
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
    this.get_reference_frame_value = function (value, timeStep) {
        reference_frame_value = this.reference_frames[this.reference_frame].transform(this, value, timeStep);
        return Math.round (reference_frame_value * 100) / 100;
    }

};
