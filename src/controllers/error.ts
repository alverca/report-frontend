/**
 * エラーコントローラー
 *
 * @namespace controller/error
 */

import { Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';

export function notFound(req: Request, res: Response) {
    const message = `router for [${req.originalUrl}] not found.`;
    if ((<string>req.get('accept')).indexOf('application/json') >= 0) {
        res.status(NOT_FOUND).json({
            status: 'error',
            message
        });
    } else {
        res.status(NOT_FOUND).render('error/notFound', {
            message,
            layout: 'layouts/error'
        });
    }
}

export function badRequest(err: any, req: Request, res: Response) {
    if ((<string>req.get('accept')).indexOf('application/json') >= 0) {
        res.status(BAD_REQUEST).json({
            status: 'error',
            message: err.message
        });
    } else {
        res.status(BAD_REQUEST).render('error/badRequest', {
            message: err.message,
            layout: 'layouts/error'
        });
    }
}

export function internalServerError(req: Request, res: Response) {
    const message = 'an unexpected error has occurred';
    if ((<string>req.get('accept')).indexOf('application/json') >= 0) {
        res.status(INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message
        });
    } else {
        res.status(INTERNAL_SERVER_ERROR).render('error/internalServerError', {
            message,
            layout: 'layouts/error'
        });
    }
}
