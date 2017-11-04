var configs1 = {
    'none': {
    },
    'config1-1': {
        "moneyAsJSon": {
            "udFormulaKey": "BasicUD",
            "referenceFrameKey": "monetaryUnit",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": false
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 1000,
            "timeLowerBoundInYears": 0,
            "timeUpperBoundInYears": 5,
            "calculateGrowth": false,
            "growthTimeUnit": "YEAR",
            "growth": 0.1,
            "demographicProfileKey": "None",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 80,
            "xMpvDemography": 40,
            "plateauDemography": 78,
            "xScaleDemography": 4,
            "accountCount": 1,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 0,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curConfigId" : "config1-1",
            "curTabId": "IntroItem",
            "accountsChart": {
                "hiddenSeries": ['average', "stable_average"]
            },
            "dividendChart": {
                "hiddenSeries": ["stable_dividend"]
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": ["stable_monetary_supply"]
            },
            "selectedAccount": 0,
            "commentedId": "config1-1"
        }
    },
    
    'config1-2': {
        "moneyAsJSon": {
            "udFormulaKey": "BasicUD",
            "referenceFrameKey": "monetaryUnit",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": false
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 100,
            "timeLowerBoundInYears": 0,
            "timeUpperBoundInYears": 5,
            "calculateGrowth": false,
            "growthTimeUnit": "YEAR",
            "growth": 0.1,
            "demographicProfileKey": "None",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 80,
            "xMpvDemography": 40,
            "plateauDemography": 78,
            "xScaleDemography": 4,
            "accountCount": 1,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 100,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curConfigId" : "config1-2",
            "curTabId": "IntroItem",
            "accountsChart": {
                "hiddenSeries": ['average', "stable_average"]
            },
            "dividendChart": {
                "hiddenSeries": ["stable_dividend"]
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": ["stable_monetary_supply"]
            },
            "selectedAccount": 0,
            "commentedId": "config1-2"
        }
    },
    
    'config1-3': {
        "moneyAsJSon": {
            "udFormulaKey": "BasicUD",
            "referenceFrameKey": "monetaryUnit",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": false
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 96.6,
            "timeLowerBoundInYears": 0,
            "timeUpperBoundInYears": 41,
            "calculateGrowth": true,
            "growthTimeUnit": "YEAR",
            "growth": 0.09660822712436135,
            "demographicProfileKey": "None",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 80,
            "xMpvDemography": 40,
            "plateauDemography": 78,
            "xScaleDemography": 4,
            "accountCount": 1,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 100,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curConfigId" : "config1-3",
            "curTabId": "IntroItem",
            "accountsChart": {
                "hiddenSeries": ['average', "stable_average"]
            },
            "dividendChart": {
                "hiddenSeries": ["stable_dividend"]
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": ["stable_monetary_supply"]
            },
            "selectedAccount": 0,
            "commentedId": "config1-3"
        }
    }
};

var configs2 = {
    'none': {
    },
    'config2-1': {
        "moneyAsJSon": {
            "udFormulaKey": "BasicUD",
            "referenceFrameKey": "average",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": false
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 1000,
            "timeLowerBoundInYears": 0,
            "timeUpperBoundInYears": 10,
            "calculateGrowth": true,
            "growthTimeUnit": "YEAR",
            "growth": 0.09660822712436135,
            "demographicProfileKey": "None",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 80,
            "xMpvDemography": 40,
            "plateauDemography": 78,
            "xScaleDemography": 4,
            "accountCount": 2,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 0,
                "udProducer": true
            },
            "account1": {
                "id": 2,
                "birth": 3,
                "StartingPercentage": 0,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curTabId": "IntroItem",
            "curConfigId": "config2-1",
            "accountsChart": {
                "hiddenSeries": ["stable_average"]
            },
            "dividendChart": {
                "hiddenSeries": ["stable_dividend"]
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": ["stable_monetary_supply"]
            },
            "selectedAccount": 1,
            "commentedId": "config2-1"
        }
    },
    'config2-2': {
        "moneyAsJSon": {
            "udFormulaKey": "UDG",
            "referenceFrameKey": "average",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": false
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 1000,
            "timeLowerBoundInYears": 0,
            "timeUpperBoundInYears": 80,
            "calculateGrowth": true,
            "growthTimeUnit": "YEAR",
            "growth": 0.09660822712436135,
            "demographicProfileKey": "Cauchy",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 80,
            "xMpvDemography": 40,
            "plateauDemography": 78,
            "xScaleDemography": 4,
            "accountCount": 2,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 0,
                "udProducer": true
            },
            "account1": {
                "id": 2,
                "birth": 35,
                "StartingPercentage": 0,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curTabId": "IntroItem",
            "curConfigId": "config2-2",
            "accountsChart": {
                "hiddenSeries": ["stable_average"]
            },
            "dividendChart": {
                "hiddenSeries": []
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": []
            },
            "selectedAccount": 1,
            "commentedId": "config2-2"
        }
    },
    'config2-3': {
        "moneyAsJSon": {
            "udFormulaKey": "UDG",
            "referenceFrameKey": "dividend",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": false
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 1000,
            "timeLowerBoundInYears": 0,
            "timeUpperBoundInYears": 80,
            "calculateGrowth": true,
            "growthTimeUnit": "YEAR",
            "growth": 0.09660822712436135,
            "demographicProfileKey": "Cauchy",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 80,
            "xMpvDemography": 40,
            "plateauDemography": 78,
            "xScaleDemography": 4,
            "accountCount": 4,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 0,
                "udProducer": true
            },
            "account1": {
                "id": 2,
                "birth": 35,
                "StartingPercentage": 0,
                "udProducer": true
            },
            "account2": {
                "id": 3,
                "birth": 45,
                "StartingPercentage": 0,
                "udProducer": true
            },
            "account3": {
                "id": 4,
                "birth": 25,
                "StartingPercentage": 0,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curConfigId" : "config2-3",
            "curTabId": "IntroItem",
            "accountsChart": {
                "hiddenSeries": []
            },
            "dividendChart": {
                "hiddenSeries": []
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": []
            },
            "selectedAccount": 3,
            "commentedId": "config2-3"
        }
    }
};

var configs3 = {
    'none': {
    },
    'config3-1': {
        "moneyAsJSon": {
            "udFormulaKey": "UDG",
            "referenceFrameKey": "dividend",
            "referenceFrames": {
                "monetaryUnit": {
                    "logScale": false
                },
                "dividend": {
                    "logScale": true
                },
                "average": {
                    "logScale": false
                }
            },
            "lifeExpectancy": 80,
            "dividendStart": 1000,
            "timeLowerBoundInYears": 5,
            "timeUpperBoundInYears": 80,
            "calculateGrowth": false,
            "growthTimeUnit": "YEAR",
            "growth": 0.1,
            "demographicProfileKey": "Plateau",
            "maxDemography": 10000,
            "xMinDemography": 0,
            "xMaxDemography": 40,
            "xMpvDemography": 40,
            "plateauDemography": 38,
            "xScaleDemography": 4,
            "accountCount": 1,
            "account0": {
                "id": 1,
                "birth": 1,
                "StartingPercentage": 0,
                "udProducer": true
            }
        },
        "guiAsJSon": {
            "curConfigId" : "config3-1",
            "curTabId": "IntroItem",
            "accountsChart": {
                "hiddenSeries": []
            },
            "dividendChart": {
                "hiddenSeries": []
            },
            "headcountChart": {
                "hiddenSeries": []
            },
            "monetarySupplyChart": {
                "hiddenSeries": []
            },
            "selectedAccount": 0,
            "commentedId": "config3-1"
        }
    }
};

