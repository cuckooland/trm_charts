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
 *      myMoney.add_account(1);
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
 * @param empty_start_account {boolean} If 'TRUE', when money starts, add some money to each account so that headcount looks like constant  
 * @param displayedPeriodInYears {int} Money duration to generate
 */
var libre_money_class = function(life_expectancy, growthTimeUnit, calculate_growth, growth, dividend_start, empty_start_account, displayedPeriodInYears) {

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
    var EMPTY_START_ACCOUNT = false;
    
    this.life_expectancy = life_expectancy || LIFE_EXPECTANCY;
    this.dividend_start = dividend_start || DIVIDEND_START;
    this.displayedPeriodInYears = displayedPeriodInYears || DISPLAYED_PERIOD_IN_YEARS;

    this.calculate_growth = calculate_growth || CALCULATE_GROWTH;
    this.growthTimeUnit = growthTimeUnit || GROWTH_TIME_UNIT;
    this.empty_start_account = empty_start_account || EMPTY_START_ACCOUNT;
    
    if (this.growthTimeUnit === this.MONTH) {
        this.growth = growth || PER_MONTH_GROWTH;
    }
    else if (this.growthTimeUnit === this.YEAR) {
        this.growth = growth || PER_YEAR_GROWTH;
    }
    else {
        throw "Growth time unit not managed";
    }
    
    this.accounts = [];
    this.reference_frames = {
        'quantitative': {
            name: "Monetary Unit",
            unit_label: 'monetary units',
            transform: function(money, value, timeStep) {
                return value;
            }
        },
        'relative': {
            name: "Dividend",
            unit_label: 'UD',
            transform: function(money, value, timeStep) {
                if (money.people.values[timeStep] > 0) {
                    return value / money.dividends.values[timeStep];
                }
                else {
                    return 0;
                }
            }
        },
        'average': {
            name: "%(M/N)",
            unit_label: '%(M/N)',
            transform: function(money, value, timeStep) {
                if (money.monetary_mass.values[timeStep] !== 0) {
                    return value / money.monetary_mass.values[timeStep] * money.people.values[timeStep] * 100;
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
            name: "UDA(t) = max[UDA(t-1);c*M(t)/N(t)]",
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var current_people = money.people.values[timeStep]
                if (current_people > 0) {
                    var current_monetary_mass = money.monetary_mass.values[timeStep];
                    return Math.max(previous_dividend, money.getGrowth() * (current_monetary_mass / current_people));
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDB': {
            name: "UDB(t) = (1+c)*UDB(t-1)",
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var current_people = money.people.values[timeStep]
                if (current_people > 0) {
                    return previous_dividend * (1 + money.getGrowth());
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDG': {
            name: "UDĞ(t) = UDĞ(t-1) + c²*M(t-1)/N(t-1)",
            calculate: function (money, timeStep) {
                var previous_dividend = money.dividends.values[timeStep - 1];
                var previous_people = money.people.values[timeStep - 1]
                var current_people = money.people.values[timeStep]
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
            name: "None",
            calculate: function (timeStep, xMin, xMax, yMax) {
                xMin = xMin || 0;
                xMax = xMax || 80;
                yMax = yMax || 0;
                
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
            name: "Triangular",
            calculate: function (timeStep, xMin, xMax, yMax) {
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
            name: "Plateau",
            calculate: function (timeStep, xMin, xMax, duration, yMax) {
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
            name: "Cauchy",
            calculate: function (timeStep, a, xMin, xMax, yMax) {
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
            name: "Damped Wave",
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
        this.people = {values : [], x: []};
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
            throw "Growth time unit not managed";
        }
    };

    this.get_people = function(timeStep) {
        var people = 0;

        // for each account...
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {

            // if account is born...
            // if account is alive...
            if (timeStep >= this.getTimeStep(this.accounts[i_account].birth, this.YEAR) && timeStep < this.getTimeStep(this.accounts[i_account].birth + this.life_expectancy, this.YEAR)) {
                // increment people count
                people++;
            }
        }
        people = people + this.population_profiles[this.population_profile].calculate(this.getTimeValue(timeStep, this.YEAR));

        return people;
    };

	this.add_account = function(birth) {
		this.accounts.push({
            name: 'Born on ' + this.asDate(birth, this.YEAR),
            id: 'member_' + (this.accounts.length + 1),
            birth: birth,
            balance: 0,
            values: [],
            x: [],
            y: [],
        });
	};

	this.asDate = function(timeStep, timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
	    
        if (timeUnit === this.MONTH) {
    	    return (2000 + Math.trunc(timeStep / 12) + 1) + '-' + (timeStep % 12) + '-01';
	    }
	    else if (timeUnit === this.YEAR) {
    	    return (2000 + timeStep) + '-01-01';
	    }
        else {
            throw "Time unit not managed";
        }
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
        throw "Growth time unit not managed";
	}
	    
	this.getDisplayedPeriod = function(timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
	    
        if (timeUnit === this.MONTH) {
	        return 12 * (this.displayedPeriodInYears - 1) + 1;
	    }
        if (timeUnit === this.YEAR) {
	        return this.displayedPeriodInYears;
	    }
        throw "Time unit not managed";
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
        throw "Time unit not managed";
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
        throw "Time unit not managed";
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
        throw "Growth time unit not managed";
	}
	
    /**
     * Return account deleted or false if only one account left
     *
     * @returns {*}|false
     */
    this.delete_last_account = function() {
        if (this.accounts.length > 1) {
            return this.accounts.pop();
        }
        return false;
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
        // create c3.js data object
		var data = {
            accounts: {
                xs: {
                    'average': 'x_average'
                },
                names: {
                    'average': 'Average "M/N"'
                },
                columns: [],
                types: {
                    average: 'area',
                }
            },
            dividend: {
                x: 'x_dividend',
                names: {
                    'dividend': 'Dividend'
                },
                columns: []
            },
            headcount: {
                x: 'x_people',
                names: {
                    'people': 'Headcount "N"'
                },
                columns: []
            },
            monetary_supply: {
                x: 'x_monetary_mass',
                names: {
                    'monetary_mass': 'Monetary Mass "M"'
                },
                columns: []
            }
        };

        var i_account, timeStep;
        // For each account...
		for (i_account = 0; i_account < this.accounts.length; i_account++) {
			// add axis mapping
			data.accounts.xs[this.accounts[i_account].id] = 'x_' + this.accounts[i_account].name;
            data.accounts.names[this.accounts[i_account].id] = this.accounts[i_account].name;
    
            // reset data
            this.accounts[i_account].balance = 0;
            this.accounts[i_account].values = [];
            this.accounts[i_account].x = [];
            this.accounts[i_account].y = [];
		}

        var monetary_mass = 0;
        var average = 0;
        
		for (timeStep = 0; timeStep <= this.getDisplayedPeriod(); timeStep++) {
            this.people.values.push(this.get_people(timeStep));
		}
        
        var moneyStartingStep = -1;
        // for each time of the people existence...
	    for (timeStep = 0; timeStep <= this.getDisplayedPeriod(); timeStep++) {
		    
                var date = this.asDate(timeStep);
                
                if (moneyStartingStep === -1 && this.people.values[timeStep] !== 0) {
                    moneyStartingStep = timeStep;
                }
                
                if (timeStep === moneyStartingStep) {
            	    if (!this.empty_start_account) {
                        // when money starts, add some money to each account so that headcount looks like constant  
                        monetary_mass += this.people.values[timeStep] * this.get_dividend_start() / this.getGrowth();
                    }
                }
                else if (moneyStartingStep !== -1) {
                    // add a dividend coming from each account
                    monetary_mass += this.people.values[timeStep - 1] * this.dividends.values[timeStep - 1];
                }
    
                // add monetary_mass
                this.monetary_mass.values.push(monetary_mass);
    
                // calculate next dividend...
                var dividend = 0;
                if (timeStep === moneyStartingStep) {
                    dividend = this.get_dividend_start();
                }
                else if (moneyStartingStep !== -1) {
                    // after first issuance, calculate next dividend depending on formula...
                    dividend = this.dividend_formulaes[this.formula_type].calculate(this, timeStep);
                }
                
                this.dividends.values.push(dividend);
    
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
    
                    // if account is born...
                    if (timeStep >= this.getTimeStep(this.accounts[i_account].birth, this.YEAR)) {
                        // if account is alive...
                        if (timeStep < this.getTimeStep(this.accounts[i_account].birth + this.life_expectancy, this.YEAR)) {
                            if (timeStep === moneyStartingStep) {
                        	    if (!this.empty_start_account) {
                                    // when money starts, add some money to each account so that headcount looks like constant  
                                    this.accounts[i_account].balance += this.get_dividend_start() / this.getGrowth();
                                }
                            }
                            else if (timeStep > this.getTimeStep(this.accounts[i_account].birth, this.YEAR)) {
                                // add a dividend to the account balance
                                this.accounts[i_account].balance += this.dividends.values[timeStep - 1];
                            }
                        }
                    }
                    // add y value
                    this.accounts[i_account].values.push(this.accounts[i_account].balance);
                }
                
                // add average
                average = monetary_mass / this.people.values[timeStep];
                this.average.values.push(average);

                if (moneyStartingStep !== -1) {
                    this.dividends.x.push(date);
                    this.dividends.y.push(this.get_reference_frame_value(dividend, timeStep));
                    
                    this.monetary_mass.x.push(date);
                    this.monetary_mass.y.push(this.get_reference_frame_value(monetary_mass, timeStep));
                }
                
                if (this.people.values[timeStep] > 0) {
                    this.average.x.push(date);
                    this.average.y.push(this.get_reference_frame_value(average, timeStep));
                }
                
                this.people.x.push(date);
                
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
    
                    // if account is born...
                    if (timeStep >= this.getTimeStep(this.accounts[i_account].birth, this.YEAR)) {
                        this.accounts[i_account].x.push(date);
                        this.accounts[i_account].y.push(this.get_reference_frame_value(this.accounts[i_account].balance, timeStep));
                    }
                }
		}

        // add axis header to data
        this.dividends.x.unshift('x_dividend');
        this.dividends.y.unshift('dividend');
        this.people.x.unshift('x_people');
        this.people.values.unshift('people');
        this.monetary_mass.x.unshift('x_monetary_mass');
        this.monetary_mass.y.unshift('monetary_mass');
        this.average.x.unshift('x_average');
        this.average.y.unshift('average');

        // add data to columns
        data.dividend.columns.push(this.dividends.x);
        data.dividend.columns.push(this.dividends.y);
        data.headcount.columns.push(this.people.x);
        data.headcount.columns.push(this.people.values);
        data.monetary_supply.columns.push(this.monetary_mass.x);
        data.monetary_supply.columns.push(this.monetary_mass.y);
        data.accounts.columns.push(this.average.x);
        data.accounts.columns.push(this.average.y);

        var toUnload = [];
        // for each account...
        for (i_account = 0; i_account < this.accounts.length; i_account++) {
            // add axis header to data
            this.accounts[i_account].x.unshift(data.accounts.xs[this.accounts[i_account].id]);
            this.accounts[i_account].y.unshift(this.accounts[i_account].id);
            // add data to columns
            if (this.accounts[i_account].x.length > 1) {
                data.accounts.columns.push(this.accounts[i_account].x);
                data.accounts.columns.push(this.accounts[i_account].y);
            }
            else {
                toUnload.push(this.accounts[i_account].id);
            }
        }
        if (toUnload.length > 0) {
            data.accounts.unload = toUnload;
        }
		return data;
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
