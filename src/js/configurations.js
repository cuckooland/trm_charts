var configs1 = {
    none: {
    },
    'config1-1': {
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
            c: "config1-1",
            t: "WorkshopsItem",
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
            a: 0,
            com: "config1-1"
        }
    },
    
    'config1-2': {
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
            ud0: 100,
            tm: 0,
            tM: 5,
            cc: false,
            cu: "YEAR",
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
            c: "config1-2",
            t: "WorkshopsItem",
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
            a: 0,
            com: "config1-2"
        }
    },
    
    'config1-3': {
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
            ud0: 96.6,
            tm: 0,
            tM: 40,
            cc: true,
            cu: "YEAR",
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
            c: "config1-3",
            t: "WorkshopsItem",
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
            a: 0,
            com: "config1-3"
        }
    }
};

var configs2 = {
    none: {
    },
    'config2-1': {
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
            t: "WorkshopsItem",
            c: "config2-1",
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
            a: 1,
            com: "config2-1"
        }
    },
    'config2-2': {
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
            t: "WorkshopsItem",
            c: "config2-2",
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
            a: 1,
            com: "config2-2"
        }
    },
    'config2-3': {
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
                b: 35,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a2: {
                id: 3,
                b: 45,
                d: 80,
                a0: 0,
                t: 'CC'
            },
            a3: {
                id: 4,
                b: 25,
                d: 80,
                a0: 0,
                t: 'CC'
            }
        },
        g: {
            c: "config2-3",
            t: "WorkshopsItem",
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
            a: 3,
            com: "config2-3"
        }
    }
};

var configs3 = {
    none: {
    },
    'config3-1': {
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
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 3,
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
                t: 'NC'
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 100,
                t: 'NC'
            },
            t0: {
                id: 1,
                f: 2,
                t: 3,
                y: 5,
                a: 5000,
                r: "monetaryUnit",
                rc: 0
            },
            t1: {
                id: 2,
                f: 3,
                t: 2,
                y: 6,
                a: 500,
                r: "monetaryUnit",
                rc: 9
            }
        },
        g: {
            t: "WorkshopsItem",
            c: "config3-1",
            ac: {
                hs: [
                    "average",
                    "stableAverage",
                    "account1"
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
            a: 2,
            tr: 1,
            s: "",
            i: -1,
            com: "config3-1"
        }
    },
    'config3-2': {
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
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 3,
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
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            },
            t0: {
                id: 1,
                f: 2,
                t: 3,
                y: 5,
                a: 5000,
                r: "monetaryUnit",
                rc: 0
            },
            t1: {
                id: 2,
                f: 3,
                t: 2,
                y: 6,
                a: 500,
                r: "monetaryUnit",
                rc: 9
            }
        },
        g: {
            t: "WorkshopsItem",
            c: "config3-2",
            ac: {
                hs: [
                    "average",
                    "stableAverage",
                    "account1"
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
            a: 2,
            tr: 1,
            s: "",
            i: -1,
            com: "config3-2"
        }
    },
    'config3-3': {
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
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 3,
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
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            },
            t0: {
                id: 1,
                f: 2,
                t: 3,
                y: 5,
                a: 5,
                r: "dividend",
                rc: 0
            },
            t1: {
                id: 2,
                f: 3,
                t: 2,
                y: 6,
                a: 0.5,
                r: "dividend",
                rc: 9
            }
        },
        g: {
            t: "WorkshopsItem",
            c: "config3-3",
            ac: {
                hs: [
                    "average",
                    "stableAverage",
                    "account1"
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
            a: 2,
            tr: 1,
            s: "",
            i: -1,
            com: "config3-3"
        }
    }
};

var configs4 = {
    none: {
    },
    'config4-1': {
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
            c: 0.1,
            d: "None",
            dyM: 10000,
            dxm: 0,
            dxM: 80,
            dxPv: 40,
            dp: 78,
            dxs: 4,
            ac: 3,
            tc: 0,
            a0: {
                id: 1,
                b: 1,
                d: 80,
                a0: 50,
                t: 'CC'
            },
            a1: {
                id: 2,
                b: 1,
                d: 80,
                a0: 150,
                t: 'CC'
            },
            a2: {
                id: 3,
                b: 1,
                d: 80,
                a0: 100,
                t: 'CC'
            }
        },
        g: {
            c: "config4-1",
            t: "WorkshopsItem",
            ac: {
                hs: ["average", "stableAverage"]
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
            a: 2,
            tr: -1,
            s: "",
            i: -1,
            com: "config4-1"
        }
    },    
    'config4-2': {
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
                d: 80,
                a0: 0,
                t: 'NC'
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
                y: 2,
                a: 10,
                r: "account",
                rc: 79
            },
            t1: {
                id: 2,
                f: 1,
                t: -1,
                y: 2,
                a: 100,
                r: "account",
                rc: 79
            }
        },
        g: {
            c: "config4-2",
            t: "WorkshopsItem",
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
            a: 3,
            tr: 0,
            s: "",
            i: -1,
            com: "config4-2"
        }
    }
};

var configs5 = {
    none: {
    },
    'config5-1': {
        m: {
            f: "UDG",
            r: "dividend",
            rs: {
                mu: {
                    log: false
                },
                ud: {
                    log: true
                },
                mn: {
                    log: false
                }
            },
            le: 80,
            ud0: 1000,
            tm: 5,
            tM: 80,
            cc: false,
            cu: "YEAR",
            c: 0.1,
            d: "Plateau",
            dyM: 10000,
            dxm: 0,
            dxM: 40,
            dxPv: 40,
            dp: 38,
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
            c: "config5-1",
            t: "WorkshopsItem",
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
            a: 0,
            com: "config4-1"
        }
    }
};