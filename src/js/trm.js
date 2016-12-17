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
 *      myMoney.add_account('moi', 1);
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
            transform: function(money, value, i_time) {
                return value;
            }
        },
        'relative': {
            name: "Dividend",
            unit_label: 'UD',
            transform: function(money, value, i_time) {
                return value / money.dividends.y[i_time];
            }
        },
        'average': {
            name: "%(M/N)",
            unit_label: '%(M/N)',
            transform: function(money, value, i_time) {
                if (money.average.y[i_time] > 0) {
                    return (value / money.average.y[i_time]) * 100;
                }
                else {
                    return 0;
                }
            }
        }
    };    
    
    this.reference_frame = 'quantitative';
    this.formula_type = 'UDA';

    // dididend formulae
    this.dividend_formulaes = {
        'UDA': {
            name: "UDA(t) = max[UDA(t-1);c*M(t)/N(t)]",
            calculate: function (money, i_time) {
                var previous_dividend = money.dividends.y[money.dividends.y.length - 1];
                var current_people = money.people.y[i_time]
                if (current_people > 0) {
                    var current_monetary_mass = money.monetary_mass.y[money.monetary_mass.y.length - 1];
                    return Math.max(previous_dividend, money.getGrowth() * (current_monetary_mass / current_people));
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDB': {
            name: "UDB(t) = (1+c)*UDB(t-1)",
            calculate: function (money, i_time) {
                var previous_dividend = money.dividends.y[money.dividends.y.length - 1];
                var current_people = money.people.y[i_time]
                if (current_people > 0) {
                    return previous_dividend * (1 + money.getGrowth());
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDG': {
            name: "UDĞ(t) = UDĞ(t-1) + c²*M(t-1)/N(t-1)",
            calculate: function (money, i_time) {
                var previous_dividend = money.dividends.y[money.dividends.y.length - 1];
                var previous_people = money.people.y[i_time - 1]
                if (previous_people > 0) {
                    var previous_monetary_mass = money.monetary_mass.y[money.monetary_mass.y.length - 2];
                    return previous_dividend + (Math.pow(money.getGrowth(), 2) * (previous_monetary_mass / previous_people));
                } else {
                    return previous_dividend;
                }
            }
        }
    };

    this.reset_dividends = function () {
        this.dividends = {x: [], i_time: [], y : [], display_y: []};
    };

    this.reset_people = function () {
        this.people = {x: [], y : []};
    };

    this.reset_monetary_mass = function () {
        this.monetary_mass = {x: [], i_time: [], y : [], display_y: []};
    };

    this.reset_average = function () {
        this.average = {x: [], i_time: [], y : [], display_y: []};
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

    this.get_people = function(i_time) {
        var people = 0;

        // for each account...
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {

            // if account is born...
            // if account is alive...
            if (i_time >= this.get_i_time(this.accounts[i_account].birth, this.YEAR) && i_time < this.get_i_time(this.accounts[i_account].birth + this.life_expectancy, this.YEAR)) {
                // increment people count
                people++;
            }
        }

        return people;
    };

	this.add_account = function(name, birth) {
		this.accounts.push({
            name: name,
            id: 'member_' + (this.accounts.length + 1),
            birth: birth,
            balance: 0,
            x: [],
            y: [],
            display_y: [],
        });
	};

	this.asDate = function(i_time, timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
	    
        if (timeUnit === this.MONTH) {
    	    return (2000 + Math.trunc(i_time / 12) + 1) + '-' + (i_time % 12) + '-01';
	    }
	    else if (timeUnit === this.YEAR) {
    	    return (2000 + i_time) + '-01-01';
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
	        return 12 * this.displayedPeriodInYears + 1;
	    }
        if (timeUnit === this.YEAR) {
	        return this.displayedPeriodInYears + 1;
	    }
        throw "Time unit not managed";
	}
	
	this.get_i_time = function(timeValue, timeUnit) {
        timeUnit = timeUnit || this.growthTimeUnit;
	    
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

        var i_account, i_time;
        // For each account...
		for (i_account = 0; i_account < this.accounts.length; i_account++) {
			// add axis mapping
			data.accounts.xs[this.accounts[i_account].id] = 'x_' + this.accounts[i_account].name;
            data.accounts.names[this.accounts[i_account].id] = this.accounts[i_account].name;
    
            // reset data
            this.accounts[i_account].balance = 0;
            this.accounts[i_account].x = [];
            this.accounts[i_account].y = [];
            this.accounts[i_account].display_y = [];
		}

        var monetary_mass = 0;
        var average = 0;
        
		for (i_time = 0; i_time <= this.getDisplayedPeriod(); i_time++) {
            this.people.x.push(this.asDate(i_time));
            this.people.y.push(this.get_people(i_time));
		}
        
        // for each time of the people existence...
	    for (i_time = 0; i_time <= this.getDisplayedPeriod(); i_time++) {
		    
		    if (this.people.y[i_time] > 0) {
                // add time x axis
                this.dividends.i_time.push(i_time);
                this.dividends.x.push(this.asDate(i_time));
                this.monetary_mass.i_time.push(i_time);
                this.monetary_mass.x.push(this.asDate(i_time));
                this.average.i_time.push(i_time);
                this.average.x.push(this.asDate(i_time));
    
                monetary_mass = 0;
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
    
                    // if account is born...
                    if (i_time >= this.get_i_time(this.accounts[i_account].birth, this.YEAR)) {
                        // if account is alive...
                        if (i_time < this.get_i_time(this.accounts[i_account].birth + this.life_expectancy, this.YEAR)) {
                            if (i_time === 0 || this.people.y[i_time - 1] === 0) {
                        	    if (!this.empty_start_account) {
                                    // when money starts, add some money to each account so that headcount looks like constant  
                                    this.accounts[i_account].balance += this.get_dividend_start() / this.getGrowth();
                                }
                            }
                            else {
                                // add a dividend to the account balance
                                this.accounts[i_account].balance += dividend;
                            }
                        }
                        // add x value
                        this.accounts[i_account].x.push(this.asDate(i_time));
                        // add y value
                        this.accounts[i_account].y.push(this.accounts[i_account].balance);
                    }
                    // increment monetary mass
                    monetary_mass += this.accounts[i_account].balance;
                }
    
                // add monetary_mass
                this.monetary_mass.y.push(monetary_mass);
    
                // add average
                average = monetary_mass / this.people.y[i_time];
                this.average.y.push(average);
                
                // calculate next dividend...
                var dividend = 0;
                if (i_time === 0 || this.people.y[i_time - 1] === 0) {
                    dividend = this.get_dividend_start();
                }
                else {
                    // after first issuance, calculate next dividend depending on formula...
                    dividend = this.dividend_formulaes[this.formula_type].calculate(this, i_time);
                }
                this.dividends.y.push(dividend);
    
                this.dividends.display_y.push(this.get_reference_frame_value(dividend, this.dividends.y.length - 1));
                this.monetary_mass.display_y.push(this.get_reference_frame_value(monetary_mass, this.monetary_mass.y.length - 1));
                this.average.display_y.push(this.get_reference_frame_value(average, this.average.y.length - 1));
                
                // for each account...
                for (i_account = 0; i_account < this.accounts.length; i_account++) {
    
                    // if account is born...
                    var birth_time = this.get_i_time(this.accounts[i_account].birth, this.YEAR);
                    if (i_time >= birth_time) {
                        // if account is alive...
                        if (i_time < this.get_i_time(this.accounts[i_account].birth + this.life_expectancy, this.YEAR)) {
                            // add display_y value
                            this.accounts[i_account].display_y.push(this.get_reference_frame_value(this.accounts[i_account].y[this.accounts[i_account].y.length - 1], this.dividends.y.length - 1));
                        }
                    }
                }
            }
		}

        // add axis header to data
        this.dividends.x.unshift('x_dividend');
        this.dividends.display_y.unshift('dividend');
        this.people.x.unshift('x_people');
        this.people.y.unshift('people');
        this.monetary_mass.x.unshift('x_monetary_mass');
        this.monetary_mass.display_y.unshift('monetary_mass');
        this.average.x.unshift('x_average');
        this.average.display_y.unshift('average');

        // add data to columns
        data.dividend.columns.push(this.dividends.x);
        data.dividend.columns.push(this.dividends.display_y);
        data.headcount.columns.push(this.people.x);
        data.headcount.columns.push(this.people.y);
        data.monetary_supply.columns.push(this.monetary_mass.x);
        data.monetary_supply.columns.push(this.monetary_mass.display_y);
        data.accounts.columns.push(this.average.x);
        data.accounts.columns.push(this.average.display_y);

        // for each account...
        for (i_account = 0; i_account < this.accounts.length; i_account++) {
            // add axis header to data
            this.accounts[i_account].x.unshift(data.accounts.xs[this.accounts[i_account].id]);
            this.accounts[i_account].y.unshift(this.accounts[i_account].id);
            this.accounts[i_account].display_y.unshift(this.accounts[i_account].id);
            // add data to columns
            data.accounts.columns.push(this.accounts[i_account].x);
            data.accounts.columns.push(this.accounts[i_account].display_y);
        }
		return data;
    };

    /**
     * Transform data to another reference_frame
     *
     * @param value {int}   Source value
     * @returns {number|*}
     */
    this.get_reference_frame_value = function (value, i_time) {
        reference_frame_value = this.reference_frames[this.reference_frame].transform(this, value, i_time);
        return Math.round (reference_frame_value * 100) / 100;
    }

};
