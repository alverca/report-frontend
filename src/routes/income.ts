/**
 * 興行外収入ルーター
 */
import * as api from '@toei-jp/report-api-nodejs-client';
import { Router } from 'express';
import * as moment from 'moment';

const incomeRouter = Router();

incomeRouter.get('', async (req, res, next) => {
    try {
        let m = moment(`${req.query.year}-${req.query.month}-${req.query.date}T00:00:00+00:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        if (!m.isValid()) {
            m = moment(`${moment().format('YYYY-MM-DD')}T00:00:00+00:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        }
        const serviceOption = {
            auth: req.user.authClient,
            endpoint: <string>process.env.API_ENDPOINT
        };
        const theaterService = new api.service.Theater(serviceOption);
        const accountService = new api.service.Account(serviceOption);
        const theaters = await theaterService.getTheaterList();
        const accounts = await accountService.getAccountList();
        const theater = theaters.find((t) => t.theaterCd === req.query.theaterCd);
        let incomes: api.factory.income.attributes[] = [];
        if (theater !== undefined) {
            const incomeService = new api.service.Income(serviceOption);
            incomes = await incomeService.searchIncome({
                theaterCd: theater.theaterCd,
                date: m.toDate()
            });
        }
        res.render('income/index', {
            title: '日報入力',
            theaters,
            accounts,
            incomes
        });
    } catch (err) {
        next(err);
    }
});

export default incomeRouter;
