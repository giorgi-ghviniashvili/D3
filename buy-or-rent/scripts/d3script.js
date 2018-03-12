setTimeout(function() {
            var t = d3;
            function e(t) {
                for (var a in e.defaults) a in t || (t[a] = e.defaults[a]);
                for (var r = t.investmentReturnRate * (1 - t.capitalGainsRate), n = 1 - t.marginalTaxRate, i = 1 + t.inflationRate, o = Math.pow(1 + r, t.years) - 1, s = 1 + t.buyGrowthRate, u = t.buyPrice * t.buyDownPaymentRate, l = t.buyPrice * t.buyPurchaseClosingRate, c = u + l, p = t.buyInterestRate / 12, d = t.buyPrice * (1 - t.buyDownPaymentRate), h = Math.round(12 * t.buyLoanYears), g = d * (p ? p / (1 - Math.pow(1 + p, -h)) : 1 / h), m = 0, f = 0, y = 0, b = 12 * t.buyCommonChargePerMonth * (1 - t.marginalTaxRate * t.buyCommonChargeDeductionRate), v = 0, x = t.buyPropertyTaxRate * n, M = 0, R = 12 * t.buyUtilitiesCostPerMonth, P = 0, C = t.buyPrice * t.buyMaintenanceCostRate, k = 0, w = 0, F = c * o, T = 0, S = 1; S <= t.years; ++S) {
                    var A = Math.pow(i, S - 1),
                        N = t.buyPrice * Math.pow(s, S);
                    if (T += (T + w) * r, h > 0) {
                        var I = Math.min(h, 12),
                            D = Math.pow(1 + p, I),
                            _ = d - (d = d * D - (p ? (D - 1) / p : 12) * g);
                        f += (I * g - _) * n, m += _, h -= I
                    }
                    y += b * A, v += N * x, M += R * A, P += C * A, k += N * t.buyInsuranceRate, w = m + f + y + v + M + P + k
                }
                var q = N * t.buySellClosingRate,
                    H = Math.max(0, N - t.buyPrice - t.capitalGainsExclusion) * t.capitalGainsRate,
                    L = q + H + d - N,
                    G = F + T,
                    Y = c + w + G + L;
                return {
                    buyDownPayment: u,
                    buyClosingCost: l,
                    buyLoanPaymentPerMonth: g,
                    buyLoanPaymentToPrincipal: m,
                    buyLoanPaymentToInterest: f,
                    buyCommonCharges: y,
                    buyPropertyTaxes: v,
                    buyUtilitiesCost: M,
                    buyMaintenanceCost: P,
                    buyInsuranceCost: k,
                    buyPurchaseOpportunityCost: F,
                    buyYearlyOpportunityCost: T,
                    buySellProceeds: -N,
                    buySellClosingCost: q,
                    buySellTaxes: H,
                    buyLoanPrincipal: d,
                    buyTotalCost: Y
                }
            }

            function a(t) {
                for (var e in a.defaults) e in t || (t[e] = a.defaults[e]);
                for (var r = t.investmentReturnRate * (1 - t.capitalGainsRate), n = Math.pow(1 + r, t.years) - 1, i = 12 * t.rentPerMonth, o = 1 + t.rentIncreasePerYear, s = t.rentPerMonth * t.rentDepositMonths, u = i * t.rentBrokerFee, l = s + u, c = 0, p = 0, d = 0, h = l * n, g = 0, m = 1; m <= t.years; ++m) {
                    var f = i * Math.pow(o, m - 1);
                    g += (g + d) * r, c += f, p += f * t.rentInsuranceRate, d = c + p
                }
                var y = -s,
                    b = h + g,
                    v = l + d + b + y;
                return {
                    rentDeposit: s,
                    rentBrokerFee: u,
                    rentCost: c,
                    rentInsuranceCost: p,
                    rentInitialOpportunityCost: h,
                    rentYearlyOpportunityCost: g,
                    rentDepositReturn: -s,
                    rentTotalCost: v
                }
            }

            function r(t) {
                var r, n, i = e(t),
                    o = 0;
                do {
                    if (r = a(t), n = i.buyTotalCost - r.rentTotalCost, Math.abs(n) <= 12 * t.years) break;
                    t.rentPerMonth *= (r.rentTotalCost + n) / r.rentTotalCost
                } while (++o < 50);
                return {
                    buy: i,
                    rent: r
                }
            }

            function n() {
                i = r(l)
            }
            e.defaults = {
                years: 6,
                buyPrice: 172e3,
                buyDownPaymentRate: .2,
                buyInterestRate: .055,
                buyPropertyTaxRate: .0135,
                buyLoanYears: 30,
                buyGrowthRate: .02,
                buyPurchaseClosingRate: .04,
                buySellClosingRate: .06,
                buyCommonChargePerMonth: 0,
                buyCommonChargeDeductionRate: 0,
                buyMaintenanceCostRate: .01,
                buyUtilitiesCostPerMonth: 100,
                buyInsuranceRate: .0046,
                investmentReturnRate: .04,
                marginalTaxRate: .2,
                capitalGainsExclusion: 5e5,
                capitalGainsRate: .15,
                inflationRate: .02
            }, a.defaults = {
                years: 6,
                rentPerMonth: 1100,
                rentDepositMonths: 1,
                rentIncreasePerYear: .03,
                rentBrokerFee: 0,
                rentInsuranceRate: .0132,
                investmentReturnRate: .04,
                capitalGainsRate: .15
            };
            var i, o = t.dispatch("edit", "editend"),
                s = t.format("$,.0f"),
                u = {},
                l = Object.create(u);
            for (var c in e.defaults) u[c] = e.defaults[c];
            for (var c in a.defaults) u[c] = a.defaults[c];
            i = r(l), o.on("edit.runtime", n), o.on("editend.runtime", n),
                function() {
                    function e() {
                        var e = "relative" === T.style("position"),
                            a = w.node().clientWidth + (e ? 14 : -V.node().clientWidth),
                            r = a - v.left - v.right;
                        r !== b && (b = r, T.style("margin-left", e ? "-10px" : null).style("margin-right", e ? null : -x.right + "px"), S.attr("width", a + x.right), I.attr("transform", "translate(" + (b + v.right) + ",0)").call(P.tickSize(-b - v.left - v.right)), D.attr("transform", "translate(" + (b + 8) + ",0)").call(C), _.each(function(e) {
                            e.scale.range([0, b]), t.select(this).call(e.axis)
                        }), q.attr("x1", -8).attr("x2", b + 8), H.attr("transform", function(t) {
                            return "translate(" + t.scale(t.get()) + ",0)"
                        }), N.each(function(t) {
                            var e = this.parentNode.__data__;
                            dx = Math.round(b / e.scaleTicks.length / 2), x1 = e.scale(t[0]), t.x0 = (this.previousSibling ? e.scale((t[0] + this.previousSibling.__data__[0]) / 2) : Math.max(-9, x1 - dx)) + 1, t.x1 = this.nextSibling ? e.scale((t[0] + this.nextSibling.__data__[0]) / 2) : Math.min(b + 8, x1 + dx), t.x = (t.x0 + t.x1) / 2
                        }).attr("d", c), Y.style("left", function(t) {
                            return t.scale(t.get()) + "px"
                        }), L.attr("width", b + v.right))
                    }

                    function a(t) {
                        l[t.key] = +this.value, o.editend(l, t.key)
                    }

                    function n(e, a) {
                        (null == a || "buyPrice" === a) && (R.domain([0, l.buyPrice / (5e3 / F)]), P.ticks(F / 40), C.ticks(F / 40, "$s"), I.call(P), D.call(C)), O.text(s(l.rentPerMonth)), $.attr("d", i(O.node().getComputedTextLength() + 10)), Y.style("bottom", function(t) {
                            return Math.max(4, Math.min(t.chartHeight + 4, -R(l.rentPerMonth))) + "px"
                        }), A.each(function(a) {
                            if (!e) {
                                var n = this.getBoundingClientRect();
                                if (n.bottom < 0 || n.top > innerHeight) return
                            }
                            var i = a.key,
                                o = a.get(),
                                s = a.scale(o);
                            t.select(this.querySelector(".g-parameter-value")).attr("transform", "translate(" + s + ",0)").select("text").text(a.shortFormat(a.get())), t.select(a.node.querySelector(".g-parameter-tip")).style("left", s + "px"), t.selectAll(this.querySelectorAll(".g-axis--x .tick text")).style("opacity", function(t) {
                                return Math.abs(s - a.scale(t)) < 40 ? 0 : 1
                            });
                            var u = Object.create(l),
                                p = a.scaleTicks.map(function(t) {
                                    return u[i] = t, r(u), u.rentPerMonth
                                }),
                                d = M(a.data, s, 1, a.data.length - 1),
                                h = s - a.data[d - 1].x > a.data[d].x - s ? d : d - 1;
                            t.selectAll(this.querySelectorAll(".g-bar path")).each(function(t, e) {
                                t.y = p[e], t.yMax = a.chartHeight
                            }).classed("g-bar--active", function(t, e) {
                                return e === h
                            }).attr("d", c)
                        })
                    }

                    function i(t) {
                        return "M5,0h" + (t / 2 - 10) + "a5,5 0 0,0 5,-5v-10a5,5 0 0,0 -5,-5h" + (-t + 10) + "a5,5 0 0,0 -5,5v10a5,5 0 0,0 5,5h" + (t / 2 - 10) + "l5,5z"
                    }

                    function c(t) {
                        var e = R(0) - R(t.y);
                        return isNaN(e) || isNaN(t.x0) || 0 >= e ? "M0,0Z" : e > t.yMax ? "M" + t.x0 + ",0v" + -t.yMax + "L" + (t.x0 + t.x1) / 2 + "," + (-t.yMax - 5) + "L" + t.x1 + "," + -t.yMax + "V0Z" : "M" + t.x0 + ",0v" + -e + "H" + t.x1 + "V0Z"
                    }

                    function p(e) {
                        t.select(e.node.querySelector(".g-parameter-input")).interrupt().classed("g-parameter-input--modified", !0), e.startValue = e.get(), e.startY = t.mouse(this)[1], e.node.querySelector("input").select(), d.apply(this, arguments)
                    }

                    function d(e) {
                        var a = t.mouse(this),
                            r = e.set(Math.abs(a[1] - e.startY) > 40 ? e.startValue : e.scale.invert(a[0])),
                            n = e.node.querySelector("input");
                        n.value = e.format(r), n.className = 0 > r ? "g-parameter-input--negative" : "g-parameter-input--positive", o.edit(l, e.key), t.event.sourceEvent.preventDefault()
                    }

                    function h(e) {
                        t.select(e.node.querySelector(".g-parameter-input")).classed("g-parameter-input--modified", e.get() !== u[e.key]), e.startValue = e.startY = null, o.editend(l, e.key)
                    }

                    function g() {
                        return 27 === t.event.keyCode ? void this.blur() : void 0
                    }

                    function m(e) {
                        var a = "" === this.value ? 0 / 0 : e.parse(this.value);
                        isNaN(a) && (a = u[e.key]), a = e.set(a), this.value = e.format(a), this.className = 0 > a ? "g-parameter-input--negative" : "g-parameter-input--positive", t.select(this.parentNode).classed("g-parameter-input--modified", a !== u[e.key]), o.editend(l, e.key)
                    }

                    function f(e) {
                        var a = t.select(this.parentNode).classed("g-parameter-input--modified", !1),
                            r = a.select("input").node();
                        t.event.stopPropagation(), a.transition().duration(750).tween("options", function() {
                            var a = t.interpolate(l[e.key], u[e.key]);
                            return function(t) {
                                var n = e.set(a(t));
                                r.value = e.format(n), r.className = 0 > n ? "g-parameter-input--negative" : "g-parameter-input--positive", o.edit(l, e.key)
                            }
                        }).each("end", function(t) {
                            o.editend(l, t.key)
                        })
                    }

                    function y(t) {
                        return t
                    }
                    var b, v = {
                            top: 5,
                            right: 60,
                            bottom: 35,
                            left: 20
                        },
                        x = {
                            right: 5
                        },
                        M = t.bisector(function(t) {
                            return t.x
                        }).left,
                        R = t.scale.linear(),
                        P = t.svg.axis().scale(R).orient("right").tickFormat(""),
                        C = t.svg.axis().scale(R).orient("right").tickPadding(4),
                        k = {
                            year: {
                                parse: function(t) {
                                    return parseFloat(t.replace(/[^-0-9.]+/g, ""))
                                },
                                format: function(t) {
                                    return t + " year" + (1 === t ? "" : "s")
                                },
                                shortFormat: t.format("d"),
                                round: Math.round
                            },
                            month: {
                                parse: function(t) {
                                    return parseFloat(t.replace(/[^-0-9.]+/g, ""))
                                },
                                format: function(t) {
                                    return t + " month" + (1 === t ? "" : "s")
                                },
                                shortFormat: t.format("d"),
                                round: Math.round
                            },
                            preciseRate: {
                                parse: function(t) {
                                    return t.replace(/[%,]/g, "") / 100
                                },
                                format: t.format(".2%"),
                                shortFormat: t.format(".2%"),
                                round: y
                            },
                            rate: {
                                parse: function(t) {
                                    return t.replace(/[%,]/g, "") / 100
                                },
                                format: t.format(".1%"),
                                shortFormat: t.format(".1%"),
                                round: y
                            },
                            bigRate: {
                                parse: function(t) {
                                    return t.replace(/[%,]/g, "") / 100
                                },
                                format: t.format(".0%"),
                                shortFormat: t.format(".0%"),
                                round: y
                            },
                            changeRate: {
                                parse: function(t) {
                                    return t.replace(/[%,]/g, "") / 100
                                },
                                format: t.format(".1%"),
                                shortFormat: t.format("+.1%"),
                                round: y
                            },
                            dollars: {
                                parse: function(t) {
                                    return +t.replace(/[$,]/g, "")
                                },
                                format: t.format("$,.0f"),
                                shortFormat: t.format("$,.0f"),
                                round: y
                            },
                            bigDollars: {
                                parse: function(t) {
                                    return +t.replace(/[$,]/g, "")
                                },
                                format: t.format("$,.0f"),
                                shortFormat: function(e) {
                                    return t.format("$." + Math.min(3, Math.floor(Math.log(e) / Math.LN10) - 2) + "s")(e)
                                },
                                round: y
                            }
                        },
                        w = t.selectAll("[data-parameter]").datum(function() {
                            var e = this.getAttribute("data-parameter"),
                                a = k[this.getAttribute("data-type")],
                                r = new Function("d3", "v", "return " + this.getAttribute("data-restrict")),
                                n = new Function("d3", "return " + this.getAttribute("data-scale"))(t).clamp(!0),
                                i = n.range()[0],
                                o = n.range()[1];
                            return this.hasAttribute("data-value") && (u[e] = +this.getAttribute("data-value")), {
                                node: this,
                                key: e,
                                get: function() {
                                    return l[e]
                                },
                                set: function(a) {
                                    return l[e] = r(t, a)
                                },
                                parse: a.parse,
                                format: a.format,
                                shortFormat: a.shortFormat,
                                chartHeight: (+this.getAttribute("data-height") || 120) - v.top - v.bottom,
                                scale: n.interpolate(t.interpolateRound).clamp(!0),
                                scaleFormat: this.getAttribute("data-scale-format"),
                                scaleTicks: t.range(i, o + 1e-6, (o - i) / 40).map(n.invert).map(a.round).reduce(function(t, e) {
                                    return t[t.length - 1] !== e && t.push(e), t
                                }, [])
                            }
                        }).style("height", function(t) {
                            return t.chartHeight + v.top + v.bottom + "px"
                        });
                    t.selectAll(".g-question-answer input").datum(function() {
                        return {
                            key: this.name
                        }
                    }).on("change", a);
                    var F = t.max(w.data(), function(t) {
                        return t.chartHeight
                    });
                    R.range([0, -F]);
                    var T = w.insert("div", "*").attr("class", "g-parameter-chart"),
                        S = T.append("svg").attr("height", function(t) {
                            return t.chartHeight + v.top + v.bottom
                        }),
                        A = S.append("g").attr("transform", function(t) {
                            return "translate(" + v.left + "," + (v.top + t.chartHeight) + ")"
                        }),
                        N = A.append("g").attr("class", "g-bar").selectAll("path").data(function(t) {
                            return t.scaleTicks
                        }).enter().append("path").datum(function(t) {
                            return [t]
                        });
                    A.each(function(e) {
                        e.data = t.select(this).selectAll(".g-bar path").data()
                    });
                    var I = A.append("g").attr("class", "g-axis g-axis--y g-axis--y-inner"),
                        D = A.append("g").attr("class", "g-axis g-axis--y g-axis--y-outer"),
                        _ = A.append("g").attr("class", "g-axis g-axis--x").attr("transform", "translate(0," + (R(0) + 10) + ")").each(function(e) {
                            e.axis = t.svg.axis().orient("bottom").scale(e.scale).ticks(5, e.scaleFormat).tickSize(5).tickPadding(5)
                        });
                    _.append("line").attr("class", "g-baseline-halo"), _.append("line").attr("class", "g-baseline");
                    var q = _.selectAll(".g-baseline,.g-baseline-halo").attr("y1", -7).attr("y2", -7);
                    w.append("div").attr("class", "g-mobile-axis-label").text("EQUIV. RENT");
                    var H = A.append("g").attr("class", "g-parameter-value");
                    H.append("path").attr("d", "M-5.5,-2.5v10l6,5.5l6,-5.5v-10z"), H.append("text").style("text-anchor", "middle").attr("y", 20).attr("dy", ".71em");
                    var L = A.append("rect").style("fill", "none").style("pointer-events", "all").style("cursor", "ew-resize").attr("ontouchstart" in document ? {
                            y: -20,
                            height: 50
                        } : {
                            y: function(t) {
                                return -t.chartHeight - v.top
                            },
                            height: function(t) {
                                return t.chartHeight + v.top + v.bottom
                            }
                        }).call(t.behavior.drag().on("dragstart", p).on("drag", d).on("dragend", h)),
                        G = 120,
                        Y = T.append("svg").attr("class", "g-parameter-tip").attr("width", G).attr("height", 25).style("margin-left", v.left - G / 2 + "px").style("margin-bottom", v.bottom + 4 + "px"),
                        z = Y.append("g").attr("transform", "translate(" + G / 2 + ",20)"),
                        $ = z.append("path"),
                        O = z.append("text").attr("y", -6),
                        V = w.append("div").attr("class", "g-parameter-input");
                    V.append("input").property("value", function(t) {
                        return t.format(t.get())
                    }).property("disabled", "ontouchstart" in document).on("keydown", g).on("change", m);
                    var f = V.append("svg").attr("class", "g-parameter-reset").attr("width", 19).attr("height", 19).on("click", f).on("touchstart", f).append("g").attr("transform", "translate(9.5,9.5)");
                    f.append("title").text("Reset"), f.append("circle").attr("r", "45%"), f.append("path").attr("d", t.svg.symbol().type("cross").size(60)).attr("transform", "rotate(45)"), o.on("edit.edit", function(t, e) {
                        n(!1, e)
                    }).on("editend.edit", function(t, e) {
                        n(!0, e)
                    }), t.select(window).on("resize.edit", e).each(e)
                }(),
                function() {
                    function e() {
                        c.classed("g-negative", l.rentPerMonth <= 0).classed("g-positive", l.rentPerMonth > 0), p.text(function(t) {
                            return t(l, i, s)
                        })
                    }

                    function a() {
                        var t = n.getBoundingClientRect(),
                            e = t.top < 47;
                        r != e && u.classed("g-fixed", r = e)
                    }
                    var r = !1,
                        n = document.querySelector("#g-fixed-container"),
                        u = t.select("#g-fixed"),
                        c = t.select(".interactive-graphic"),
                        p = t.selectAll(".g-value").datum(function() {
                            return new Function("options", "cost", "formatCurrency", "return " + this.getAttribute("data-value"))
                        });
                    o.on("edit.display", e).on("editend.display", e), t.select(window).on("resize.display", a).on("scroll.display", a).each(a)
                }(), o.editend(l)
        }, 0);