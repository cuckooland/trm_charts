var configs1 = {
    none: {
    },
    'cS0': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 5,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            c: "cS0",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            com: "cS0"
        }
    },

    'cSMN': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 5,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            }
        },
        g: {
            c: "cSMN",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            com: "cSMN"
        }
    },
    
    'cX40': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 966,
            tm: 0,
            tM: 41,
            cc: true,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.09660822712436135,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            }
        },
        g: {
            c: "cX40",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            com: "cX40"
        }
    },
    
    'cNOSTEP': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 966,
            tm: 0,
            tM: 41,
            cc: true,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.09660822712436135,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            }
        },
        g: {
            c: "cNOSTEP",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "L",
            a: 0,
            com: "cNOSTEP"
        }
    },

    'cSMN-M': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 79.74,
            tm: 0,
            tM: 5,
            cc: false,
            cu: "MONTH",
            pu: "MONTH",
            c: 0.00797,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            }
        },
        g: {
            c: "cSMN-M",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            com: "cSMN-M"
        }
    },
    
    'cS0-M': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 79.74,
            tm: 0,
            tM: 5,
            cc: false,
            cu: "MONTH",
            pu: "MONTH",
            c: 0.00797,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            c: "cS0-M",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            com: "cS0-M"
        }
    },

    'cS0-YM': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 5,
            cc: false,
            cu: "YEAR",
            pu: "MONTH",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 1,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            c: "cS0-YM",
            t: "WorkshopsTab",
            ac: {
                hs: ['average', "stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            com: "cS0-YM"
        }
    },

};

var configs2 = {
    none: {
    },
    'c2CC': {
        m: {
            f: "BasicUD",
            r: "average",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 10,
            cc: true,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.09660822712436135,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a1: {
                id: 2,
                b: 3,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c2CC",
            ac: {
                hs: ["stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 1,
            com: "c2CC"
        }
    },
    'cCAUCHY': {
        m: {
            f: "UDG",
            r: "average",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 80,
            cc: true,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.09660822712436135,
            d: "Cauchy",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a1: {
                id: 2,
                b: 35,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "cCAUCHY",
            ac: {
                hs: ["stableAverage"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: []
            },
            ct: "SA",
            a: 1,
            com: "cCAUCHY"
        }
    },
    'c4DATES': {
        m: {
            f: "UDG",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 80,
            cc: true,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.09660822712436135,
            d: "Cauchy",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 4,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a1: {
                id: 2,
                b: 25,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a2: {
                id: 3,
                b: 35,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a3: {
                id: 4,
                b: 45,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            c: "c4DATES",
            t: "WorkshopsTab",
            ac: {
                hs: []
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: []
            },
            ct: "SA",
            a: 3,
            com: "c4DATES"
        }
    }
};

var configs3 = {
    none: {
    },
    'cLMU1': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 20,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 2,
            tc: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'NC'
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 100,
                t: 'NC'
            },
            t0: {
                id: 1,
                f: 1,
                t: 2,
                y: 5,
                a: 5000,
                r: "monetaryUnit",
                rc: 1
            },
            t1: {
                id: 2,
                f: 2,
                t: 1,
                y: 6,
                a: 500,
                r: "monetaryUnit",
                rc: 10
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "cLMU1",
            ac: {
                hs: [
                    "average",
                    "stableAverage"
                ]
            },
            dc: {
                hs: [
                    "stableDividend"
                ]
            },
            hc: {
                hs: [

                ]
            },
            sc: {
                hs: [
                    "stableMonetarySupply"
                ]
            },
            ct: "SA",
            a: 1,
            tr: 1,
            s: "",
            i: -1,
            com: "cLMU1"
        }
    },
    'cLMU2': {
        m: {
            f: "BasicUD",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 20,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 2,
            tc: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            },
            t0: {
                id: 1,
                f: 1,
                t: 2,
                y: 5,
                a: 5000,
                r: "monetaryUnit",
                rc: 1
            },
            t1: {
                id: 2,
                f: 2,
                t: 1,
                y: 6,
                a: 500,
                r: "monetaryUnit",
                rc: 10
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "cLMU2",
            ac: {
                hs: [
                    "average",
                    "stableAverage"
                ]
            },
            dc: {
                hs: [
                    "stableDividend"
                ]
            },
            hc: {
                hs: [

                ]
            },
            sc: {
                hs: [
                    "stableMonetarySupply"
                ]
            },
            ct: "SA",
            a: 1,
            tr: 1,
            s: "",
            i: -1,
            com: "cLMU2"
        }
    },
    'cLUD': {
        m: {
            f: "BasicUD",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 20,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 2,
            tc: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            },
            t0: {
                id: 1,
                f: 1,
                t: 2,
                y: 5,
                a: 5,
                r: "dividend",
                rc: 1
            },
            t1: {
                id: 2,
                f: 2,
                t: 1,
                y: 6,
                a: 0.5,
                r: "dividend",
                rc: 10
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "cLUD",
            ac: {
                hs: [
                    "average",
                    "stableAverage"
                ]
            },
            dc: {
                hs: [
                    "stableDividend"
                ]
            },
            hc: {
                hs: [

                ]
            },
            sc: {
                hs: [
                    "stableMonetarySupply"
                ]
            },
            ct: "SA",
            a: 1,
            tr: 1,
            s: "",
            i: -1,
            com: "cLUD"
        }
    }
};

var configs4 = {
    none: {
    },
    'c3CC': {
        m: {
            f: "BasicUD",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 40,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 4,
            tc: 0,
            a0: {
                id: 1,
                b: 1,
                d: 240,
                a0: 0,
                t: 'COM'
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 50,
                t: 'CC'
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 150,
                t: 'CC'
            },
            a3: {
                id: 4,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            }
        },
        g: {
            c: "c3CC",
            t: "WorkshopsTab",
            ac: {
                hs: ["average", "stableAverage", "account1"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 2,
            tr: -1,
            s: "",
            i: -1,
            com: "c3CC"
        }
    },    
    'c3UBI': {
        m: {
            f: "BasicUD",
            r: "monetaryUnit",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 40,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 4,
            tc: 2,
            a0: {
                id: 1,
                b: 1,
                d: 240,
                a0: 0,
                t: 'COM'
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 50,
                t: 'NC'
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 150,
                t: 'NC'
            },
            a3: {
                id: 4,
                b: 1,
                d: 80,
                a0: 100,
                t: 'NC'
            },
            t0: {
                id: 1,
                f: -1,
                t: 1,
                y: 1,
                a: 10,
                r: "account",
                rc: 240
            },
            t1: {
                id: 2,
                f: 1,
                t: -1,
                y: 1,
                a: 100,
                r: "account",
                rc: 240 
            }
        },
        g: {
            c: "c3UBI",
            t: "WorkshopsTab",
            ac: {
                hs: ["average", "stableAverage", "account1"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 3,
            tr: 0,
            s: "",
            i: -1,
            com: "c3UBI"
        }
    },
    'c4CC': {
        m: {
            f: "BasicUD",
            r: "average",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 40,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 5,
            tc: 0,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: "COM"
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 50,
                t: "CC"
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 150,
                t: "CC"
            },
            a3: {
                id: 4,
                b: 1,
                d: 80,
                a0: 100,
                t: "CC"
            },
            a4: {
                id: 5,
                b: 10,
                d: 80,
                a0: 0,
                t: "CC"
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c4CC",
            ac: {
                hs: ["average", "stableAverage", "account1"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 3,
            tr: -1,
            s: "",
            i: -1,
            com: "c4CC"
        }
    },
    'c4UBI': {
        m: {
            f: "BasicUD",
            r: "average",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 40,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 5,
            tc: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: "COM"
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 50,
                t: "NC"
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 150,
                t: "NC"
            },
            a3: {
                id: 4,
                b: 1,
                d: 80,
                a0: 100,
                t: "NC"
            },
            a4: {
                id: 5,
                b: 10,
                d: 80,
                a0: 0,
                t: "NC"
            },
            t0: {
                id: 1,
                f: -1,
                t: 1,
                y: 1,
                a: 10,
                r: "account",
                rc: 80
            },
            t1: {
                id: 2,
                f: 1,
                t: -1,
                y: 1,
                a: 100,
                r: "account",
                rc: 80
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c4UBI",
            ac: {
                hs: ["average", "stableAverage", "account1"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 4,
            tr: 0,
            s: "",
            i: -1,
            com: "c4UBI"
        }
    },
    'c4CC-M': {
        m: {
            f: "BasicUD",
            r: "average",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 40,
            cc: false,
            cu: "MONTH",
            pu: "MONTH",
            c: 0.00797,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 5,
            tc: 0,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: "COM"
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 50,
                t: "CC"
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 150,
                t: "CC"
            },
            a3: {
                id: 4,
                b: 1,
                d: 80,
                a0: 100,
                t: "CC"
            },
            a4: {
                id: 5,
                b: 10,
                d: 80,
                a0: 0,
                t: "CC"
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c4CC-M",
            ac: {
                hs: ["average", "stableAverage", "account1"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 3,
            tr: -1,
            s: "",
            i: -1,
            com: "c4CC-M"
        }
    },
    'c4UBI-M': {
        m: {
            f: "BasicUD",
            r: "average",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 40,
            cc: false,
            cu: "MONTH",
            pu: "MONTH",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 5,
            tc: 2,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: "COM"
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 50,
                t: "NC"
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 150,
                t: "NC"
            },
            a3: {
                id: 4,
                b: 1,
                d: 80,
                a0: 100,
                t: "NC"
            },
            a4: {
                id: 5,
                b: 10,
                d: 80,
                a0: 0,
                t: "NC"
            },
            t0: {
                id: 1,
                f: -1,
                t: 1,
                y: 1,
                a: 0.797,
                r: "account",
                rc: 960
            },
            t1: {
                id: 2,
                f: 1,
                t: -1,
                y: 1,
                a: 100,
                r: "account",
                rc: 960
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c4UBI-M",
            ac: {
                hs: ["average", "stableAverage", "account1"]
            },
            dc: {
                hs: []
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 4,
            tr: 0,
            s: "",
            i: -1,
            com: "c4UBI-M"
        }
    }
};

var configs5 = {
    none: {
    },
    'c160f': {
        m: {
            f: "BasicUD",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 161,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 6,
            tc: 0,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: "CC"
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 100,
                t: "CC"
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 200,
                t: "CC"
            },
            a3: {
                id: 4,
                b: 81,
                d: 80,
                a0: 0,
                t: "CC"
            },
            a4: {
                id: 5,
                b: 81,
                d: 80,
                a0: 0,
                t: "CC"
            },
            a5: {
                id: 6,
                b: 81,
                d: 80,
                a0: 0,
                t: "CC"
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c160f",
            ac: {
                hs: ["stableAverage", "account4", "account5", "account6"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 0,
            tr: -1,
            s: "",
            i: -1,
            com: "c160f"
        }
    },
    'c160h': {
        m: {
            f: "BasicUD",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: false
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 0,
            tM: 161,
            cc: false,
            cu: "YEAR",
            pu: "YEAR",
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 6,
            tc: 3,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 0,
                t: "CC"
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 100,
                t: "CC"
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 200,
                t: "CC"
            },
            a3: {
                id: 4,
                b: 81,
                d: 80,
                a0: 0,
                t: "CC"
            },
            a4: {
                id: 5,
                b: 81,
                d: 80,
                a0: 0,
                t: "CC"
            },
            a5: {
                id: 6,
                b: 81,
                d: 80,
                a0: 0,
                t: "CC"
            },
            t0: {
                id: 1,
                f: 1,
                t: 4,
                y: 82,
                a: 100,
                r: "account",
                rc: 1
            },
            t1: {
                id: 2,
                f: 2,
                t: 4,
                y: 82,
                a: 100,
                r: "account",
                rc: 1
            },
            t2: {
                id: 3,
                f: 3,
                t: 5,
                y: 82,
                a: 100,
                r: "account",
                rc: 1
            }
        },
        g: {
            t: "WorkshopsTab",
            c: "c160h",
            ac: {
                hs: ["stableAverage"]
            },
            dc: {
                hs: ["stableDividend"]
            },
            hc: {
                hs: []
            },
            sc: {
                hs: ["stableMonetarySupply"]
            },
            ct: "SA",
            a: 1,
            tr: 2,
            s: "",
            i: -1,
            com: "c160h"
        }
    }        
}
