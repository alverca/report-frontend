/**
 * 興行外収入ルーター
 */
import * as api from '@toei-jp/report-api-nodejs-client';
import { Request, Response, Router } from 'express';
// tslint:disable-next-line:no-submodule-imports
import { query, validationResult } from 'express-validator/check';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status';
import * as moment from 'moment';

import { Common as Message } from '../common/Const/Message';

const apiRouter = Router();

apiRouter.get(
    '/getScreeningWork',
    [
        query('date').exists().withMessage(Message.required.replace('$fieldName$', '日付'))
            .isISO8601().withMessage(Message.invalidDateFormat.replace('$fieldName$', '日付')),
        query('theaterCd').exists().withMessage(Message.required.replace('$fieldName$', '劇場コード'))
    ],
    async (req: Request, res: Response) => {
        const error = validationResult(req);
        if (error.isEmpty()) {
            try {
                const serviceOption = {
                    auth: req.user.authClient,
                    endpoint: <string>process.env.API_ENDPOINT
                };
                const m = moment(`${req.query.date}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
                const screeningWorkService = new api.service.ScreeningWork(serviceOption);
                const screeningWorks = await screeningWorkService.getScreeningWorkList({
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
            } catch (err) {
                res.status(INTERNAL_SERVER_ERROR).json({ error: err.code });
            }
        } else {
            res.status(BAD_REQUEST).json(error.array());
        }
    }
);

apiRouter.post(
    '/saveIncomes',
    [],
    async (req: Request, res: Response) => {
        const error = validationResult(req);
        if (error.isEmpty()) {
            try {
                const serviceOption = {
                    auth: req.user.authClient,
                    endpoint: <string>process.env.API_ENDPOINT
                };
                const incomeService = new api.service.Income(serviceOption);
                await incomeService.saveIncomes(req.body.data);
                res.header('Content-Type', 'application/json');
                res.json({ status: 'success' });
            } catch (err) {
                res.status(INTERNAL_SERVER_ERROR).json({ error: err.code });
            }
        } else {
            res.status(BAD_REQUEST).json(error.array());
        }
    }
);

export default apiRouter;
