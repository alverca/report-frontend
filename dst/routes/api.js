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
// tslint:disable-next-line:no-submodule-imports
const check_1 = require("express-validator/check");
const http_status_1 = require("http-status");
const moment = require("moment");
const Message_1 = require("../common/Const/Message");
const apiRouter = express_1.Router();
apiRouter.get('/getScreeningWork', [
    check_1.query('date').exists().withMessage(Message_1.Common.required.replace('$fieldName$', '日付'))
        .isISO8601().withMessage(Message_1.Common.invalidDateFormat.replace('$fieldName$', '日付')),
    check_1.query('theaterCd').exists().withMessage(Message_1.Common.required.replace('$fieldName$', '劇場コード'))
], (req, res) => __awaiter(this, void 0, void 0, function* () {
    const error = check_1.validationResult(req);
    if (error.isEmpty()) {
        try {
            const serviceOption = {
                auth: req.user.authClient,
                endpoint: process.env.API_ENDPOINT
            };
            const m = moment(`${req.query.date}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
            const screeningWorkService = new api.service.ScreeningWork(serviceOption);
            const screeningWorks = yield screeningWorkService.getScreeningWorkList({
                boxOfficeStart: {
                    to: m.toDate()
                },
                boxOfficeEnd: {
                    from: m.toDate()
                },
                theaterCd: req.query.theaterCd
            });
            res.header('Content-Type', 'application/json');
            res.json(screeningWorks);
        }
        catch (err) {
            res.status(http_status_1.INTERNAL_SERVER_ERROR).json({ error: err.code });
        }
    }
    else {
        res.status(http_status_1.BAD_REQUEST).json(error.array());
    }
}));
apiRouter.post('/saveIncomes', [], (req, res) => __awaiter(this, void 0, void 0, function* () {
    const error = check_1.validationResult(req);
    if (error.isEmpty()) {
        try {
            const serviceOption = {
                auth: req.user.authClient,
                endpoint: process.env.API_ENDPOINT
            };
            const incomeService = new api.service.Income(serviceOption);
            yield incomeService.saveIncomes(req.body.data);
            res.header('Content-Type', 'application/json');
            res.json({ status: 'success' });
        }
        catch (err) {
            res.status(http_status_1.INTERNAL_SERVER_ERROR).json({ error: err.code });
        }
    }
    else {
        res.status(http_status_1.BAD_REQUEST).json(error.array());
    }
}));
exports.default = apiRouter;
