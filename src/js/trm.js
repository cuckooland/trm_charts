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
 * @param dividend_start {int} First dividend amount
 * @param money_duration {int} Money duration to generate
 * @param growth {double} Money duration to generate
 * @param calculate_growth {boolean} Calculate growth from life expectancy
 */
var libre_money_class = function(life_expectancy, dividend_start, money_duration, growth, calculate_growth, by_month) {

    var LIFE_EXPECTANCY = 80;
    var DIVIDEND_START = 1000;
    var MONEY_DURATION = 5;
    var CALCULATE_GROWTH = true;
    var GROWTH = 20;
    var BY_MONTH = false;
    
    this.life_expectancy = life_expectancy || LIFE_EXPECTANCY;
    this.dividend_start = dividend_start || DIVIDEND_START;
    this.money_duration = money_duration || MONEY_DURATION;

    this.growth = growth || GROWTH;
    // Calculate growth from life expectancy
    this.calculate_growth = calculate_growth || CALCULATE_GROWTH;
    this.by_month = by_month || BY_MONTH;
    
    this.accounts = [];
    this.reference_frames = {
        'quantitative': {
            name: "Monetary Unit",
            unit_label: 'Units',
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
            name: "% (M/N)",
            unit_label: '% (M/N)',
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
            name: "UDA(t) = max[UDA(t-1);c*M(t-1)/N(t)]",
            calculate: function (growth, previous_dividend, previous_monetary_mass, previous_people, current_people) {
                if (current_people > 0) {
                    return Math.max(previous_dividend, growth * (previous_monetary_mass / current_people));
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDB': {
            name: "UDB(t) = (1+c)*UDB(t-1)",
            calculate: function (growth, previous_dividend, previous_monetary_mass, previous_people, current_people) {
                if (current_people > 0) {
                    return Math.ceil(previous_dividend * (1 + growth));
                } else {
                    return previous_dividend;
                }
            }
        },
        'UDG': {
            name: "UDĞ(t) = UDĞ(t-1) + c²*M(t-1)/N(t-1)",
            calculate: function (growth, previous_dividend, previous_monetary_mass, previous_people, current_people) {
                if (previous_people > 0) {
                    return previous_dividend + (Math.pow(growth, 2) * (previous_monetary_mass / previous_people));
                } else {
                    return previous_dividend;
                }
            }
        }
    };

    this.reset_dividends = function () {
        this.dividends = {x: [], y : [], display_y: []};
    };

    this.reset_people = function () {
        this.people = {x: [], y : []};
    };

    this.reset_monetary_mass = function () {
        this.monetary_mass = {x: [], y : [], display_y: []};
    };

    this.reset_average = function () {
        this.average = {x: [], y : [], display_y: []};
    };

    this.calc_growth = function() {
        this.growth = Math.pow(this.life_expectancy / 2, 2 / this.life_expectancy) - 1;
        // this.growth = Math.log(this.life_expectancy/2) / (this.life_expectancy/2);
    };

    this.get_people = function(i_time) {
        var people = 0;

        // for each account...
        for (var i_account = 0; i_account < this.accounts.length; i_account++) {

            // if account is born...
            // if account is alive...
            if (this.getYear(i_time) >= this.accounts[i_account].birth && this.getYear(i_time) < this.accounts[i_account].birth + this.life_expectancy) {
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

	this.asDate = function(i_time) {
	    if (this.by_month) {
    	    return (2000 + Math.trunc(i_time / 12) + 1) + '-' + (i_time % 12) + '-01';
	    }
	    else {
    	    return (2000 + i_time) + '-01-01';
	    }
	}
	
	this.getGrowth = function() {
	    if (this.by_month) {
	        return Math.pow((1 + this.growth), 1/12) - 1;
	    }
	    else {
	        return this.growth;
	    }
	}
	    
	this.getMoneyDuration = function() {
	    if (this.by_month) {
	        return 12 * this.money_duration + 1;
	    }
	    else {
	        return this.money_duration + 1;
	    }
	}
	
	this.getYear = function(i_time) {
	    if (this.by_month) {
	        return i_time / 12 + 1;
	    }
	    else {
	        return i_time;
	    }
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
                    'average': 'Average'
                },
                columns: [],
                types: {
                    average: 'area',
                }
            },
            dividend: {
                xs: {
                    'dividend': 'x_dividend'
                },
                names: {
                    'dividend': 'Dividend'
                },
                columns: []
            },
            headcount: {
                xs: {
                    'people': 'x_people'
                },
                names: {
                    'people': 'People'
                },
                columns: []
            },
            monetary_supply: {
                xs: {
                    'monetary_mass': 'x_monetary_mass'
                },
                names: {
                    'monetary_mass': 'Monetary Mass'
                },
                columns: []
            }
        };

        var i_account, i_time;
        // For each account...
		for (i_account = 0; i_account < this.accounts.length; i_account++) {
			// add axis mapping
			data.accounts.xs[this.accounts[i_account].id] = 'x_' + this.accounts[i_account].name;

            // reset data
            this.accounts[i_account].balance = 0;
            this.accounts[i_account].x = [];
            this.accounts[i_account].y = [];
            this.accounts[i_account].display_y = [];
		}

        var dividend = this.dividend_start;
        var previous_people = 0;
        var people = 0;
        var monetary_mass = 0;
        var average = 0;
        // for each dividend issuance...
		for (i_time = 1; i_time <= this.getMoneyDuration(); i_time++) {

            // add time x axis
            this.dividends.x.push(this.asDate(i_time));
            this.people.x.push(this.asDate(i_time));
            this.monetary_mass.x.push(this.asDate(i_time));
            this.average.x.push(this.asDate(i_time));

            // after first issuance, increase dividend by growth...
            if (i_time > 1) {
                previous_people = people;
                people = this.get_people(i_time);
                // calculate next dividend depending on formula...
                dividend = this.dividend_formulaes[this.formula_type].calculate(
                    this.getGrowth(),
                    this.dividends.y[this.dividends.y.length - 1],
                    this.monetary_mass.y[this.monetary_mass.y.length - 1],
                    people,
                    previous_people
                );
            }
            else {
                people = this.get_people(i_time);
            }
                

            this.dividends.y.push(dividend);

            monetary_mass = 0;
            average = 0;
            // for each account...
            for (i_account = 0; i_account < this.accounts.length; i_account++) {

                data.accounts.names[this.accounts[i_account].id] = this.accounts[i_account].name;

                // if account is born...
                if (this.getYear(i_time) >= this.accounts[i_account].birth) {
                    // if account is alive...
                    if (this.getYear(i_time) < this.accounts[i_account].birth + this.life_expectancy) {
                        // add a dividend to the account balance
                        this.accounts[i_account].balance += this.dividends.y[this.dividends.y.length - 1];
                    }
                    // add x value
                    this.accounts[i_account].x.push(this.asDate(i_time));
                    // add y value
                    this.accounts[i_account].y.push(this.accounts[i_account].balance);
                }
                // increment monetary mass
                monetary_mass += this.accounts[i_account].balance;
            }

            // calculate average
            average = (people > 0) ? (monetary_mass / people) : 0;

            // add people count
            this.people.y.push(people);

            // add monetary_mass
            this.monetary_mass.y.push(monetary_mass);

            // add average
            this.average.y.push(average);
		}

		for (i_time = 1; i_time <= this.getMoneyDuration(); i_time++) {

            this.dividends.display_y.push(this.get_reference_frame_value(this.dividends.y[i_time-1], i_time-1));

            // for each account...
            for (i_account = 0; i_account < this.accounts.length; i_account++) {

                // if account is born...
                if (this.getYear(i_time) >= this.accounts[i_account].birth) {
                    // add display_y value
                    this.accounts[i_account].display_y.push(this.get_reference_frame_value(this.accounts[i_account].y[i_time-this.accounts[i_account].birth], i_time-1));
                }
            }

            // add monetary_mass
            this.monetary_mass.display_y.push(this.get_reference_frame_value(this.monetary_mass.y[i_time-1], i_time-1));

            // add average
            this.average.display_y.push(this.get_reference_frame_value(this.average.y[i_time-1], i_time-1));
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
        return this.reference_frames[this.reference_frame].transform(this, value, i_time);
    }

};
