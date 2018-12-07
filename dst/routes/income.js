"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 興行外収入ルーター
 */
const api = require("@toei-jp/report-api-nodejs-client");
const express_1 = require("express");
const moment = require("moment");
const incomeRouter = express_1.Router();
incomeRouter.get('', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let m = moment(`${req.query.year}-${req.query.month}-${req.query.date}T00:00:00+00:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        if (!m.isValid()) {
            m = moment(`${moment().format('YYYY-MM-DD')}T00:00:00+00:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        }
        const serviceOption = {
            auth: req.user.authClient,
            endpoint: process.env.API_ENDPOINT
        };
        const theaterService = new api.service.Theater(serviceOption);
        const accountService = new api.service.Account(serviceOption);
        const theaters = yield theaterService.getTheaterList();
        const accounts = yield accountService.getAccountList();
        const theater = theaters.find((t) => t.theaterCd === req.query.theaterCd);
        let incomes = [];
        if (theater !== undefined) {
            const incomeService = new api.service.Income(serviceOption);
            incomes = yield incomeService.searchIncome({
                theaterCd: theater.theaterCd,
                date: m.toDate()
            });
        }
        res.render('income/index', {
            title: '興行外収入',
            theaters,
            accounts,
            incomes
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = incomeRouter;
